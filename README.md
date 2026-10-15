# quesly.me

Landing page for **Quesly** — one question a day. Plain HTML, CSS and JS: no build step, no dependencies.

```
index.html        landing (hero → today's question → how it works → why → ritual → widgets → stories → manifesto → FAQ → early access)
privacy.html      Privacy Policy   (https://quesly.me/privacy)
terms.html        Terms of Use     (https://quesly.me/terms)
404.html
assets/css/styles.css   design tokens mirror Quesly/Core/Theme.swift in the app
assets/js/main.js       question of the day, countdown, scroll animations, sign-up form
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
- **Deploy.** Every push to the default branch deploys to GitHub Pages (Settings → Pages → Source: *GitHub Actions*).
- **Domain `quesly.me`.** Settings → Pages → Custom domain: `quesly.me`, then *Enforce HTTPS*. DNS at the registrar:

  | Type | Host | Value |
  |---|---|---|
  | A | @ | 185.199.108.153 |
  | A | @ | 185.199.109.153 |
  | A | @ | 185.199.110.153 |
  | A | @ | 185.199.111.153 |
  | AAAA | @ | 2606:50c0:8000::153 |
  | AAAA | @ | 2606:50c0:8001::153 |
  | AAAA | @ | 2606:50c0:8002::153 |
  | AAAA | @ | 2606:50c0:8003::153 |
  | CNAME | www | viktorpaskar.github.io |
- **The app** still links to `quesly.app/privacy` and `quesly.app/terms` (Settings screen) — switch them to `quesly.me`.

## Logo

`assets/img/quesly-logo-*.svg` — the mark (bar, three dots, bar) and the QUESLY wordmark as outlines of Outfit Black,
built from the same proportions as `QueslyLogo.swift` in the app. Variants: on green (lime + white), green, ink,
and the mark alone.
