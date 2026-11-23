# SwiftMove Removals — demo website

Static multi-page site (HTML, CSS and a little vanilla JavaScript). No build step, no backend.

## Pages
- `index.html` — Home
- `about.html` — About Us
- `services.html` — Our Services
- `areas.html` — Areas We Cover
- `quote.html` — multi-step quote form (demo only)
- `contact.html` — Contact
- `legal.html` — Privacy Policy and Terms placeholders

## Publish a preview with GitHub Pages
1. Create a repository and upload everything in this folder to the root (keep the `css`, `js` and `assets` folders).
2. Go to **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
3. After a minute the site is live at `https://<username>.github.io/<repository>/`.

All links are relative, so the site works from a sub-folder URL.

## Adding photography
Image areas use illustrated tiles (`.media`). To use a photo, add it to `assets/` and set it inline:

```html
<div class="media" style="background-image:url('assets/house-removals.jpg')"></div>
```

Then remove the SVG icon inside that tile.

## Note
SwiftMove Removals is a fictional company. Figures, reviews and contact details are illustrative; the phone number is from Ofcom's reserved range for drama use and the email uses the reserved `.example` domain.
