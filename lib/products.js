/**
 * Shop catalog. Replace amounts/names or set Stripe Price IDs in Vercel env:
 * STRIPE_PRICE_AMBITION_GUIDE=price_xxx
 */
export const PRODUCTS = {
  "ambition-guide": {
    id: "ambition-guide",
    name: "Practical Ambition Guide",
    description:
      "A digital guide on lifestyle, ambition, and navigating new rooms.",
    amount: 2900,
    currency: "usd",
    priceEnvKey: "STRIPE_PRICE_AMBITION_GUIDE",
  },
  "room-playbook": {
    id: "room-playbook",
    name: "Room Playbook",
    description:
      "Frameworks for showing up with confidence where you weren't born in.",
    amount: 1900,
    currency: "usd",
    priceEnvKey: "STRIPE_PRICE_ROOM_PLAYBOOK",
  },
};

export function getProduct(productId) {
  return PRODUCTS[productId] ?? null;
}
