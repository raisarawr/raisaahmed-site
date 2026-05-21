# Shop — raisaahmed.com/shop

Checkout at **https://raisaahmed.com/shop** using **Stripe Checkout Sessions** (`ui_mode: elements`) and the **Payment Element**. The API runs on **Vercel** serverless functions (`/api/*`). **Cloudflare is DNS only** — do not put Stripe keys there.

## Launch order

### Phase A — Domain and site (no Stripe keys in Cloudflare)

1. **Vercel**
   - Import the GitHub repo as a new project.
   - Framework preset: **Other** (static site + serverless functions).
   - Root directory: repository root (no build command; output is the repo root).
   - Deploy once to get a `*.vercel.app` preview URL.

2. **Vercel custom domains**
   - Add `raisaahmed.com` and `www.raisaahmed.com`.
   - Vercel shows the DNS records you need.

3. **Cloudflare DNS** (domain registrar / DNS only)
   - Remove conflicting records (e.g. old Squarespace A records on `@`, stale CNAMEs).
   - Add the records Vercel provides (often **A** `@` → `76.76.21.21` and **CNAME** `www` → `cname.vercel-dns.com`, or use Vercel’s Cloudflare integration).

4. **Verify**
   - https://raisaahmed.com
   - https://raisaahmed.com/shop/

### Phase B — Stripe (keys in Vercel only)

1. **Stripe Dashboard** — you already have API keys. Prefer a **[restricted key](https://docs.stripe.com/keys/restricted-api-keys)** (`rk_…`) with:
   - Checkout Sessions: **Write**
   - Checkout Sessions: **Read**

2. **Vercel → Project → Settings → Environment Variables**
   - `STRIPE_SECRET_KEY` — `rk_…` or `sk_…` (server only; never in git or Cloudflare)
   - `STRIPE_PUBLISHABLE_KEY` — `pk_…` (served to the browser via `GET /api/config`)
   - Optional: `STRIPE_PRICE_AMBITION_GUIDE`, `STRIPE_PRICE_ROOM_PLAYBOOK`

   Add for **Production** (live keys) and **Preview** (test keys).

3. **Redeploy** on Vercel after saving env vars.

4. **Test** at `/shop` with card `4242 4242 4242 4242` ([Stripe test mode](https://docs.stripe.com/testing.md)).

## Local development

```bash
cd /Users/raisa/raisaahmed-site
cp .env.example .env.local
# Edit .env.local with test keys

npm install
npx vercel dev
```

- Main site: http://localhost:3000  
- Shop: http://localhost:3000/shop/

## Project layout

| Path | Purpose |
|------|---------|
| `shop/` | Shop UI (`index.html`, `complete.html`, CSS, JS) |
| `api/` | Vercel serverless routes for Stripe |
| `lib/products.js` | Catalog and prices |
| `vercel.json` | Redirect `/shop` → `/shop/` |

## Edit products

- Copy and prices: [`shop/index.html`](shop/index.html) and [`lib/products.js`](lib/products.js) (amounts in cents)
- Styles: [`shop/shop.css`](shop/shop.css)
- Checkout: [`shop/shop.js`](shop/shop.js)

After payment, Stripe redirects to `/shop/complete.html?session_id=…`.

## Go live checklist

- [ ] DNS points to Vercel (Cloudflare)
- [ ] `raisaahmed.com` and `/shop` load on Vercel
- [ ] Stripe env vars set in **Vercel** (not Cloudflare)
- [ ] Test checkout in test mode, then switch to live keys
- [ ] [Stripe go-live checklist](https://docs.stripe.com/get-started/checklist/go-live.md)
