# Shaiprasath Photography — website (HTML, CSS, JavaScript)

A plain static website: no React, no build step, no npm.

## Open it

- **Quick look:** double-click `index.html`.
- **Better (matches a real server):** in VS Code, right-click `index.html` → *Open with Live Server*,
  or run `npx serve .` / `python -m http.server` in this folder.
- **Publish:** upload the whole folder to any host (Netlify, Vercel, GitHub Pages, cPanel, S3).

## Files

```
index.html                 Home (cut-out story hero, chapters, film strip, contact sheet…)
weddings/index.html        Weddings
stories/index.html         Story journal with filters
stories/<name>/index.html  One page per story (10)
services/index.html        Services & starting prices
studio/index.html          About the studio
contact/index.html         Enquiry form
credits/index.html         Credits for the hero backgrounds
404.html                   Not-found page
css/style.css              All styles (colours and fonts at the top)
js/main.js                 All behaviour: header, menu, hero, film strip, reveals, filters, form
js/vendor/                 GSAP + ScrollTrigger (animation library, loaded as plain scripts)
public/images/             The studio's photographs, by category, plus hero cut-outs
public/brand/              Logo files
```

## Common edits

- **Text and photos** — edit the HTML directly. Each photo has a full size (`name.webp`, ~1800px)
  and a small size (`name-sm.webp`, ~820px) used in `srcset`.
- **Swap a photo** — replace the file in `public/images/...` with one of the same name.
- **Colours / fonts** — the variables at the top of `css/style.css`.
- **Phone number** — search the HTML for `95005 88836`; also `SETTINGS` at the top of `js/main.js`.
- **Header and footer** are repeated on every page (no templates in plain HTML) — change them in each file.
- **Prices** are a flat ₹5,000 placeholder on every package for the design review — set the real prices
  in `index.html` (packages and chapter panels), `services/index.html`, and the SEO block in each page.

## Enquiry form

Set `formEndpoint` in `SETTINGS` at the top of `js/main.js` to a form service that accepts JSON
(Formspree, Web3Forms, Getform…). Until then the form validates and tells visitors their message was
not sent, with the studio's phone number.

## The hero

A layered gallery: eight of the studio's photographs float at three depths (far, middle, near)
around one centre photograph, with the headline either side of it. As you scroll, each depth drifts
outward at its own speed — near photos fastest — while the centre photograph opens to fill the
screen and a closing line appears over it. On desktop the depths also follow the mouse gently.

- **Swap a floating photo** — change its `src` in the hero in `index.html`. Position and size are the
  `--x / --y / --w` values on each `<figure>` (desktop) and `--mx / --my / --mw` (phones; figures
  marked `fl--desk` are desktop only). `data-depth` sets how fast it moves (0.45 far, 0.75 middle, 1.15 near).
- **Swap the centre photograph** — change the image inside `.hero__main` (currently `bridal-16`).
- Motion lives in `initHero` in `js/main.js`. With reduce-motion on, the composed still is shown.

Scrolling is smoothed site-wide with Lenis (`js/vendor/lenis.min.js`, set up in `initSmoothScroll`).

## Before going live — checklist

1. **Sample reviews** — the "Kind words" section on the home page uses placeholder reviews written for the
   design review. Replace them with real reviews (with the families' permission) or remove the section.
   Search `index.html` for `SAMPLE REVIEWS`.
2. **Prices** — every package shows a placeholder ₹5,000. Update in `index.html`, `services/index.html`
   and in the structured data (search the site for `5000` and `5,000`).
3. **Map** — the Contact page map points at Gandhipuram. When the exact address is confirmed, change the
   two Google Maps links in `contact/index.html` (search `MAP:`).
4. **Domain** — the SEO uses `https://www.shaiprasathphotography.com` as a placeholder address. Find and
   replace it across every `.html` file, `sitemap.xml` and `robots.txt` with the real domain.
5. **Enquiry form, WhatsApp, email** — see "Enquiry form" above.

## SEO in this site

- Every page has its own keyword title and description (wedding photographer Coimbatore, bridal,
  pre-wedding, maternity, baby…), canonical link, Open Graph / X previews and location tags.
- Structured data (schema.org JSON-LD): the business as a LocalBusiness with services and prices, a
  WebSite, breadcrumbs on every inner page, a FAQ on the Services page (also shown visibly), and an image
  gallery on every story page.
- `sitemap.xml` (with image entries), `robots.txt` and `site.webmanifest` sit in the root folder.
- After launch: verify the site in Google Search Console and submit `sitemap.xml`, and create/claim the
  Google Business Profile for the studio — that, plus genuine reviews, is what puts a studio in the
  local "photographer near me" map results.
