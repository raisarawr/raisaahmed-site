# raisaahmed.com

A single-page static site for [raisaahmed.com](https://raisaahmed.com).

## Local preview

```bash
cd /Users/raisa/raisaahmed-site
python3 -m http.server 8080
```

Open http://localhost:8080

## Typography (Google Fonts)

Fonts load from [Google Fonts](https://fonts.google.com) via the stylesheet link in `index.html`:

- **Source Serif 4** (600–700) — hero title (`Hi, I'm Raisa`)
- **Lora** (400, 500, 600; italic 400 for the headline) — headline, about copy, buttons, footer

CSS variables in `styles.css`: `--font-title` and `--font-body`. No API key or kit setup required.

## Portrait images

Drop three portrait photos into `images/`:

- `portrait-1.jpg` (back layer)
- `portrait-2.jpg` (middle)
- `portrait-3.jpg` (front)

See `images/README.md` for details.

## Project files

| File | Purpose |
|------|---------|
| `index.html` | Content and structure |
| `styles.css` | Stripe-inspired light theme, layered portraits, animations |
| `script.js` | Parallax on pointer/scroll, footer year |
| `images/` | Portrait assets |

## Deploy on Cloudflare Pages (free)

1. Push this folder to a **GitHub** repository (public or private).
2. In [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select the repo. Build settings:
   - **Framework preset:** None
   - **Build command:** (leave empty)
   - **Build output directory:** `/` (project root)
4. Deploy. Note the `*.pages.dev` URL and confirm the site looks correct.
5. **Custom domain:** Pages project → **Custom domains** → add `raisaahmed.com` and `www.raisaahmed.com`. Cloudflare will add DNS records automatically if the domain is on the same account.
6. **Substack:** If `raisaahmed.com` is still set as your publication domain in Substack, remove it so DNS can point to Pages.
7. **SSL:** Keep **Full** under SSL/TLS (default on Cloudflare).

### Direct upload (no GitHub)

Workers & Pages → Create → **Upload assets** → drag the project folder. Re-upload when you change files.

## Edit content

- Copy: `index.html`
- Styles: `styles.css`
- Motion: `script.js`
