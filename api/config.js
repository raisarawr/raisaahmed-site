/** GET /api/config — publishable key only (safe for the browser). */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return res.status(503).json({ error: "Stripe is not configured." });
  }

  return res.status(200).json({ publishableKey });
}
