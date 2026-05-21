# raisaahmed.com

Personal site and shop for [raisaahmed.com](https://raisaahmed.com).

| What | Where |
|------|--------|
| **Hosting** | [Vercel](https://vercel.com) |
| **DNS** | [Cloudflare](https://dash.cloudflare.com) (domain only — no Stripe keys here) |
| **Shop** | https://raisaahmed.com/shop |
| **Payments** | Stripe via Vercel `/api/*` routes |

## Local preview

**Static only** (no checkout API):

```bash
cd /Users/raisa/raisaahmed-site
python3 -m http.server 8080
```

Open http://localhost:8080

**Full site + shop + Stripe** (requires `.env.local`):

```bash
npm install
npx vercel dev
```

## Typography (Google Fonts)

Fonts load from [Google Fonts](https://fonts.google.com) via the stylesheet link in `index.html`:

- **Source Serif 4** (600–700) — hero title (`Hi, I'm Raisa`)
- **Lora** (400, 500, 600) — about copy, buttons, footer

CSS variables in `styles.css`: `--font-title` and `--font-body`.

## Color palette

Photo-inspired, bright editorial theme (see `:root` in `styles.css`):

| Role | Variable | Hex |
|------|----------|-----|
| Background | `--bg` | `#faf7f2` (warm cream) |
| Background soft | `--bg-soft` | `#f4f7fa` (light blue-white) |
| Text | `--text` | `#2d2a26` |
| Muted | `--muted` | `#6b6560` |
| Primary CTA | `--accent` | `#b85c4a` (brick terracotta) |
| Secondary / links | `--accent-secondary` | `#7a9eb8` (sky blue) |
| Mint accent | `--accent-mint` | `#8fbfb0` |
| Borders | `--border` | `#e8e2d9` |

## Portrait images

Gallery order (left → right):

- `portrait-fiat.jpg` — mint-green Fiat, light-blue knit
- `portrait-trench.jpg` — tan trench, headscarf, sunglasses
- `portrait-brownstone.jpg` — red door, brownstone steps

See `images/README.md` for file naming notes.

## Project files

| Path | Purpose |
|------|---------|
| `index.html`, `styles.css`, `script.js` | Main site |
| `shop/` | Shop at `/shop` |
| `api/` | Vercel serverless (Stripe) |
| `lib/products.js` | Shop catalog |
| `vercel.json` | Redirects |

## Shop (Stripe)

See **[SHOP.md](./SHOP.md)** for launch order, Vercel env vars, and checkout testing.

## Deploy on Vercel (hosting)

1. Push this repo to **GitHub**.
2. [Vercel](https://vercel.com) → **Add New Project** → import the repo.
3. Framework: **Other**. Leave build command empty. Output directory: root (`.`).
4. Deploy; confirm the `*.vercel.app` URL works.
5. **Settings → Domains** → add `raisaahmed.com` and `www.raisaahmed.com`.
6. In **Cloudflare DNS**, point the domain at Vercel using the records Vercel shows (remove old conflicting apex/`www` records).
7. For payments: add Stripe env vars in **Vercel** (see [SHOP.md](./SHOP.md) Phase B) and redeploy.

## Edit content

- Main site copy: `index.html`
- Main styles: `styles.css`
- Shop: `shop/` and `lib/products.js`
