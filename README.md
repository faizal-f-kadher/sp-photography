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
- **Prices** (weddings from ₹29,999, outdoor from ₹11,999, baby from ₹4,999) come from the studio's
  Instagram posts — confirm they're current.

## Enquiry form

Set `formEndpoint` in `SETTINGS` at the top of `js/main.js` to a form service that accepts JSON
(Formspree, Web3Forms, Getform…). Until then the form validates and tells visitors their message was
not sent, with the studio's phone number.

## The hero

Four chapters of one family's story — the bride, the wedding, the waiting, the family — then the album.
Each chapter is a background plate, a cut-out subject (`public/images/cutouts/`) and the words either side.
Scrolling moves the subject past the camera while the next chapter opens through a temple-arch cut
(`initHero` in `js/main.js`). With reduce-motion on, the chapters simply stack.

Background plates are licensed Unsplash photos loaded from Unsplash's CDN (credited on the credits page),
so they need an internet connection.
