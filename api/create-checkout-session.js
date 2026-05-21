import Stripe from "stripe";
import { getProduct } from "../lib/products.js";

/** POST /api/create-checkout-session */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: "Stripe secret key is not configured." });
  }

  const productId = req.body?.productId;
  const quantity = Math.min(Math.max(Number(req.body?.quantity) || 1, 1), 10);
  const product = getProduct(productId);

  if (!product) {
    return res.status(400).json({ error: "Unknown product." });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const origin = `${protocol}://${host}`;

  const priceId = product.priceEnvKey
    ? process.env[product.priceEnvKey]
    : null;

  const lineItem = priceId
    ? { price: priceId, quantity }
    : {
        price_data: {
          currency: product.currency,
          unit_amount: product.amount,
          product_data: {
            name: product.name,
            description: product.description,
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
      // Omit payment_method_types — dynamic payment methods (Stripe best practice)
    });

    if (!session.client_secret) {
      return res.status(500).json({ error: "Could not start checkout." });
    }

    return res.status(200).json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Stripe checkout.sessions.create failed:", err.message);
    return res.status(500).json({ error: "Could not create checkout session." });
  }
}
