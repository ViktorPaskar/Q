# quesly.me — landing for the Quesly app

Static site (HTML/CSS/JS, GSAP + ScrollTrigger + Lenis vendored), hosted on a Cloudflare Worker that deploys on every push. **Read `docs/SITE_BRIEF.md` first**: decisions, structure, brand, Quby mascot, open tasks.

- Talk to the founder in Ukrainian (since Oct 18, 2026). Never mention iPhone/iOS/TestFlight on the site.
- Before saying a change looks good, screenshot it with Playwright at 1440, 1920 and 390 px, check the console and horizontal overflow, and send the screenshots.
- Don't push to ViktorPaskar/Quesly-App unless needed: its macOS CI minutes are used up until Nov 1, 2026.
- Avatars: classic sticker (white rim, own tilt, lime ring = answered today; aura gradient + initial without a photo), see design/avatars/sticker.html #1.
- Quby (mascot) was removed from the site at the founder's request (Oct 15, 2026): do not bring it back. Avatars are coloured initials (`avatar()` in main.js). App questions live in `QUESTIONS` in `assets/js/main.js` (mirror of the app's QuestionBank).
