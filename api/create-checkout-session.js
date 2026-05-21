import Stripe from "stripe";
import { getProduct } from "../lib/products.js";

function parseBody(req) {
  const raw = req.body;
  if (raw == null || raw === "") {
    return {};
  }
  if (typeof raw === "object") {
    return raw;
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function stripeErrorMessage(err) {
  if (err?.type?.startsWith("Stripe")) {
    return err.message;
  }
  return err?.message ?? "Unknown error";
}

/** POST /api/create-checkout-session */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe secret key is not configured." });
  }

  const body = parseBody(req);
  if (body === null) {
    return res.status(400).json({ error: "Invalid JSON body." });
  }

  const productId = body.productId;
  const quantity = Math.min(Math.max(Number(body.quantity) || 1, 1), 10);
  const product = getProduct(productId);

  if (!product) {
    return res.status(400).json({ error: "Unknown product." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${protocol}://${host}`;

  const envPrice = product.priceEnvKey
    ? process.env[product.priceEnvKey]?.trim()
    : null;
  const priceId =
    envPrice && envPrice.startsWith("price_") ? envPrice : null;

  const lineItem = priceId
    ? { price: priceId, quantity }
    : {
        price_data: {
          currency: product.currency,
          unit_amount: product.amount,
          product_data: {
            name: product.name,
            ...(product.description
              ? { description: product.description }
              : {}),
          },
        },
        quantity,
      };

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "elements",
      mode: "payment",
      line_items: [lineItem],
      return_url: `${origin}/shop/complete.html?session_id={CHECKOUT_SESSION_ID}`,
    });

    if (!session.client_secret) {
      return res.status(500).json({
        error: "Checkout session created without client_secret.",
      });
    }

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Stripe checkout.sessions.create failed:", err);
    return res.status(500).json({
      error: "Could not create checkout session.",
      detail: stripeErrorMessage(err),
    });
  }
}
