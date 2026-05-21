/**
 * Shop catalog. Optional Stripe Price IDs in Vercel env (e.g. STRIPE_PRICE_STRANGER).
 */
export const PRODUCTS = {
  stranger: {
    id: "stranger",
    name: "Stranger 🙂",
    description:
      "You don't really know me, but you'll help penny test anyways!",
    amount: 100,
    currency: "usd",
    priceEnvKey: "STRIPE_PRICE_STRANGER",
  },
  acquaintance: {
    id: "acquaintance",
    name: "Acquaintance 😊",
    description:
      "Were we in the same math class in 10th grade? Then you're doing just fine and can throw in a few more dollars!",
    amount: 500,
    currency: "usd",
    priceEnvKey: "STRIPE_PRICE_ACQUAINTANCE",
  },
  friend: {
    id: "friend",
    name: "Friend 😘",
    description:
      "You sent me a partiful invite recently, didn't you? Don't be shy!",
    amount: 2000,
    currency: "usd",
    priceEnvKey: "STRIPE_PRICE_FRIEND",
  },
  bestie: {
    id: "bestie",
    name: "Bestie 😍",
    description:
      "I repost stories with you all the time. Don't click this option, just venmo me so I'm not paying Stripe fees ❤️",
    amount: 5000,
    currency: "usd",
    priceEnvKey: "STRIPE_PRICE_BESTIE",
  },
};

export function getProduct(productId) {
  return PRODUCTS[productId] ?? null;
}
