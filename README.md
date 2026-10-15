# quesly.me

Landing page for **Quesly** — one question a day. Plain HTML, CSS and JS, no build step.
Animations: GSAP + ScrollTrigger and Lenis smooth scroll, vendored in `assets/vendor/` (no CDN at runtime).

```
index.html        landing (intro → hero scene → today's question → how it works (pinned) → features rail → answers wall → manifesto → FAQ → waitlist)
privacy.html      Privacy Policy   (https://quesly.me/privacy)
terms.html        Terms of Use     (https://quesly.me/terms)
404.html
assets/css/styles.css   design tokens mirror Quesly/Core/Theme.swift in the app
assets/js/main.js       question of the day, countdown, all animations, waitlist form
assets/vendor/          gsap 3.12.5, ScrollTrigger 3.12.5, lenis 1.1.13
assets/img/             app screenshots (from the app repo's ci-screenshots branch), logo SVGs, icons, og.png
assets/fonts/           Outfit (OFL), subset to Latin
```

## Run locally

```
python3 -m http.server 8000
```

then open http://localhost:8000.

## Things to configure

- **Early-access emails.** Set `SIGNUP_ENDPOINT` at the top of `assets/js/main.js` to any URL that accepts a JSON
  `POST {"email": "...", "source": "..."}` (Formspree, a Supabase Edge Function, Google Apps Script…).
  While it's empty, the form opens the visitor's mail app addressed to `CONTACT_EMAIL`.
- **Question of the day** in `main.js` mirrors `Shared/QuestionBank.swift`. Keep both lists in the same order
  until the questions come from the backend.
- **Hosting: Cloudflare Workers (static assets).** The Worker `q` is connected to this repo; every push to the
  production branch runs `npx wrangler deploy` and goes live on https://quesly.me in about a minute. Config is in
  `wrangler.jsonc`; `.assetsignore` keeps repo files (README, config) off the site; `_headers` sets caching and
  security headers.
- **The app** still links to `quesly.app/privacy` and `quesly.app/terms` (Settings screen) — switch them to `quesly.me`.

## Logo

`assets/img/quesly-logo-*.svg` — the mark (bar, three dots, bar) and the QUESLY wordmark as outlines of Outfit Black,
built from the same proportions as `QueslyLogo.swift` in the app. Variants: on green (lime + white), green, ink,
and the mark alone.
