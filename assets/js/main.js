// Quesly — quesly.me. GSAP + ScrollTrigger + Lenis (vendored in assets/vendor).
(() => {
  "use strict";

  // Where waitlist emails go: any endpoint that accepts a JSON POST {email, source}
  // (Formspree, a Supabase Edge Function, Google Apps Script…). Empty = fall back to email.
  const SIGNUP_ENDPOINT = "";
  const CONTACT_EMAIL = "contact@quesly.me";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;

  // ---------- Question of the day ----------
  // Mirrors Shared/QuestionBank.swift: index = (day ordinal since 0001-01-01) % count, local time.
  // Each question carries a handful of sample answers for the hero stream: [answer, username, reactions].
  const QUESTIONS = [
    ["If you only had one day off, what would you do?", ["day off,", "you do?"], [
      ["Phone off, long walk, good book", "nata.ver", "❤️"], ["Sleep till noon, then pancakes", "chill_mara", "😂 🔥"],
      ["Take my dog to the beach", "leo.martin", "🥹"], ["Finally finish that 1000-piece puzzle", "camille_b", "😂"],
      ["Cook something slow with friends", "alexo91", "❤️ 🔥"], ["Ride my bike to nowhere", "theo_runs", "🔥"]]],
    ["What's a small thing that makes you happy every day?", ["happy"], [
      ["First sip of coffee while everyone's still asleep", "alexo91", "❤️"], ["My cat waiting for me at the door", "koko_lilly", "🥹 ❤️"],
      ["Fresh sheets night", "AnnaViva", "🔥"], ["Green lights all the way home", "mr.smith", "😂"],
      ["Voice notes from my sister", "yasmine.k", "🥹"], ["Sunlight on my desk at 4pm", "arturo_sun", "❤️ 🔥"]]],
    ["If you could live anywhere in the world, where would it be?", ["anywhere", "world,"], [
      ["Lisbon. Sun, tiles and the sea", "leo.martin", "🔥"], ["A cabin with a view and fast Wi-Fi", "chill_mara", "😂"],
      ["Tokyo, for the trains and the ramen", "theo_runs", "🔥 ❤️"], ["Wherever my friends are", "camille_b", "🥹"],
      ["A tiny island in Greece", "AnnaViva", "❤️"], ["Montréal, snow included", "van.derss2", "😂"]]],
    ["If you had one superpower, what would it be?", ["superpower,"], [
      ["Teleportation. No more 2-hour train rides to see my parents", "funnnnyyy1", "❤️ 🥹"], ["Pause time for 10 minutes every morning", "john.john", "😂 🔥"],
      ["Speaking every language in the world", "koko_lilly", "🔥"], ["Healing people with a touch. Med school would be way easier", "yasmine.k", "❤️"],
      ["Never get tired. Imagine the running PRs", "theo_runs", "🔥 😂"], ["Infinite phone battery. Simple but life-changing", "chill_mara", "😂"]]],
    ["What's the best advice you've ever received?", ["best advice"], [
      ["Done is better than perfect", "mr.smith", "❤️ 🔥"], ["Call your mom more often", "arturo_sun", "🥹 ❤️"],
      ["Sleep on it before you hit send", "camille_b", "😂"], ["Be the friend you want to have", "van.derss2", "❤️"],
      ["Nobody thinks about you as much as you think", "leo.martin", "🔥"], ["Drink water. Seriously.", "AnnaViva", "😂"]]],
    ["Which song always puts you in a good mood?", ["song", "good mood?"], [
      ["Dancing Queen, every single time", "AnnaViva", "😂"], ["Mr. Blue Sky", "john.john", "🔥"],
      ["Anything my dad played in the car", "nata.ver", "🥹 ❤️"], ["Here Comes the Sun", "koko_lilly", "❤️"],
      ["September by Earth, Wind & Fire", "theo_runs", "🔥 😂"], ["The Friends theme. Don't judge", "funnnnyyy1", "😂"]]],
    ["What's something you're quietly proud of?", ["proud"], [
      ["I finally learned to swim at 27", "camille_b", "🥹 ❤️"], ["Six months without smoking", "mr.smith", "🔥"],
      ["I said no to a job that wasn't me", "yasmine.k", "❤️"], ["My sourdough actually rose", "alexo91", "😂 🔥"],
      ["I called my grandma every Sunday this year", "van.derss2", "🥹"], ["Ran my first 10K", "theo_runs", "🔥 ❤️"]]],
    ["What tiny moment made your week better?", ["tiny moment"], [
      ["A stranger held the door and smiled", "yasmine.k", "❤️"], ["My barista remembered my name", "leo.martin", "🥹"],
      ["Rain on the window while I read", "nata.ver", "❤️ 🔥"], ["My kid said thank you without being asked", "mr.smith", "🥹 ❤️"],
      ["Found 10 euros in an old jacket", "funnnnyyy1", "😂"], ["Sunset from the bus window", "chill_mara", "🔥"]]],
    ["What's one skill you'd love to learn this year?", ["skill"], [
      ["Film photography. Slow and real", "koko_lilly", "🔥"], ["Italian, to talk with my nonna", "camille_b", "🥹 ❤️"],
      ["Piano. Just one song", "AnnaViva", "❤️"], ["Cooking without a recipe", "alexo91", "😂"],
      ["Skateboarding. At 34. Why not", "john.john", "😂 🔥"], ["Sign language", "yasmine.k", "❤️ 🔥"]]],
    ["What meal feels like home to you?", ["home"], [
      ["Grandma's dumplings on a Sunday", "van.derss2", "🥹"], ["Mom's lentil soup", "yasmine.k", "❤️"],
      ["Pancakes with way too much syrup", "funnnnyyy1", "😂"], ["Rice, egg, soy sauce. Every time", "leo.martin", "🔥"],
      ["My dad's terrible but perfect pasta", "arturo_sun", "😂 ❤️"], ["Borscht with sour cream", "nata.ver", "🥹 🔥"]]],
  ];
  const DAYS_BEFORE_1970 = 719163;
  const todayIndex = (now = new Date()) =>
    (Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5) + DAYS_BEFORE_1970) % QUESTIONS.length;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function renderQuestion(el) {
    const [text, highlights] = QUESTIONS[todayIndex()];
    const mini = $("[data-today-mini]");
    if (mini) mini.textContent = text;
    if (!el) return;
    const words = text.split(" ");
    const marked = new Set();
    for (const phrase of highlights) {
      const parts = phrase.split(" ");
      for (let s = 0; s <= words.length - parts.length; s++) {
        if (parts.every((p, k) => words[s + k].toLowerCase() === p.toLowerCase())) {
          parts.forEach((_, k) => marked.add(s + k));
          break;
        }
      }
    }
    el.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">` +
      words.map((w, i) => {
        const inner = marked.has(i) ? `<mark>${esc(w)}</mark>` : esc(w);
        return `<span class="qw">${inner}</span>`;
      }).join(" ") + "</span>";
  }

  // ---------- Hero phone: today's answers type themselves into the composer ----------
  function startTyping() {
    const out = $("[data-typing]");
    if (!out) return;
    const answers = () => QUESTIONS[todayIndex()][2].map((a) => a[0]);
    if (reduceMotion) { out.textContent = answers()[0]; return; }
    let i = 0, n = 0, del = false;
    const step = () => {
      const a = answers()[i % answers().length];
      if (!del) { out.textContent = a.slice(0, ++n); if (n === a.length) { del = true; return setTimeout(step, 2200); } }
      else { out.textContent = a.slice(0, --n); if (n === 0) { del = false; i++; return setTimeout(step, 400); } }
      setTimeout(step, del ? 22 : 55 + Math.random() * 60);
    };
    setTimeout(step, 3200);
  }

  function startCountdown() {
    const out = $$("[data-countdown]");
    let last = todayIndex();
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((next - now) / 1000));
      out.forEach((el) => (el.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`));
      if (todayIndex(now) !== last) { last = todayIndex(now); renderQuestion($("[data-today]")); buildRiver(); }
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- Split headings into masked words ----------
  function split(el) {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map((w) => `<span class="sw" aria-hidden="true"><span>${esc(w)}</span></span>`).join(" ");
  }

  // ---------- Initials avatars: colour pair picked from the username, so it never changes ----------
  const AV = [["#07583D", "#D4FF00"], ["#D4FF00", "#07583D"], ["#022A1E", "#FFFFFF"], ["#EAF4EE", "#07583D"], ["#111413", "#D4FF00"], ["#FF6A1A", "#FFFFFF"], ["#2F7FE0", "#FFFFFF"], ["#F6F7F3", "#111413"]];
  const avatar = (user) => {
    let hsh = 0;
    for (const ch of user) hsh = (hsh * 31 + ch.charCodeAt(0)) >>> 0;
    const [bg, fg] = AV[hsh % AV.length];
    return `<span class="av" style="--av-bg:${bg};--av-fg:${fg}" aria-hidden="true">${esc(user.replace(/[^a-z]/gi, "").slice(0, 1))}</span>`;
  };

  // ---------- Hero title: one span per letter for the reveal ----------
  function splitChars(el) {
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const ch of n.textContent) {
          const s = document.createElement("span");
          s.className = "ch"; s.textContent = ch; s.setAttribute("aria-hidden", "true");
          frag.appendChild(s);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
    });
    walk(el);
  }

  // ---------- Feature art: shrink to fit short cards so it never covers the text ----------
  function fitArt() {
    $$(".card .art").forEach((art) => {
      art.style.setProperty("--fit", 1);
      const kids = [...art.children];
      const stories = art.classList.contains("art-stories");
      const needH = stories ? Math.max(...kids.map((k) => k.offsetHeight)) * 1.08 : art.scrollHeight;
      const needW = stories ? kids[0].offsetWidth * 2.1 : art.scrollWidth;
      const fit = Math.min(1, art.clientHeight / needH, art.clientWidth / needW);
      art.style.setProperty("--fit", fit.toFixed(3));
    });
  }

  // ---------- Emoji: swap the reaction emoji for one image set so every system shows the same ----------
  const EMO = { "❤️": "heart", "❤": "heart", "🔥": "fire", "😂": "joy", "🥹": "tears", "✨": "sparkles", "🎉": "party" };
  const EMO_RE = /❤️|❤|🔥|😂|🥹|✨|🎉/g;
  function emojify(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) =>
      /❤|🔥|😂|🥹|✨|🎉/.test(n.nodeValue) && !n.parentElement.closest("script, style, textarea, input, [data-typing], .sr-only") ? 1 : 2 });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      let last = 0;
      n.nodeValue.replace(EMO_RE, (m, i) => {
        frag.append(n.nodeValue.slice(last, i));
        const img = new Image();
        img.className = "emo"; img.src = "assets/img/emoji/" + EMO[m] + ".png"; img.alt = m; img.draggable = false;
        frag.append(img);
        last = i + m.length;
      });
      frag.append(n.nodeValue.slice(last));
      n.replaceWith(frag);
    });
  }

  // ---------- Hero answer stream: today's answers in two rows ----------
  function buildRiver() {
    const answers = QUESTIONS[todayIndex()][2];
    const card = ([a, user, rx]) => `<div class="answer-card"><p class="who">${avatar(user)}${user}</p><p>${esc(a)}</p><p class="rx">${rx}</p></div>`;
    $$("[data-river]").forEach((track, r) => {
      const list = r ? [...answers.slice(3), ...answers.slice(0, 3)] : answers;
      const html = list.map(card).join("");
      track.innerHTML = html + html; // doubled for a seamless loop
    });
    $$(".float-card").forEach((el, i) => (el.innerHTML = card(answers[i]).replace(/^<div class="answer-card">|<\/div>$/g, "")));
  }

  // ---------- Memories calendar (October 2026 starts on a Thursday) ----------
  function buildCalendar() {
    const grid = $(".art-cal .grid");
    if (!grid) return;
    let html = "";
    for (let i = 0; i < 4; i++) html += `<i class="empty"></i>`;
    for (let d = 1; d <= 31; d++) html += `<i data-d="${d}">${d}</i>`;
    grid.innerHTML = html;
  }
  function fillCalendar() {
    $$(".art-cal .grid i[data-d]").forEach((el) => {
      const d = Number(el.dataset.d);
      if (d > 14) return;
      setTimeout(() => el.classList.add(d === 10 ? "frz" : "on"), d * 70);
    });
  }

  // ---------- Waitlist form ----------
  function setupSignup() {
    const valid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    $$("[data-signup]").forEach((form) => {
      const input = $("input[type=email]", form);
      const msg = $(".signup-msg", form);
      const btn = $("button", form);
      const say = (text, state) => { msg.textContent = text; msg.dataset.state = state; };
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = input.value.trim();
        if (!valid(email)) {
          say("That email doesn't look right. Mind checking it?", "error");
          input.setAttribute("aria-invalid", "true");
          input.focus();
          return;
        }
        input.removeAttribute("aria-invalid");
        if (!SIGNUP_ENDPOINT) {
          location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quesly waitlist")}&body=${encodeURIComponent(`Please add ${email} to the Quesly waitlist.`)}`;
          say("Your email app should open. Just hit send.", "ok");
          return;
        }
        btn.disabled = true;
        say("Saving your spot…", "ok");
        try {
          const res = await fetch(SIGNUP_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, source: "quesly.me" }),
          });
          if (!res.ok) throw new Error(String(res.status));
          form.classList.add("is-done");
          say("You're on the list 🎉 We'll email you when your invite is ready.", "ok"); emojify(msg);
        } catch {
          say("Something went wrong. Please try again in a moment.", "error");
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  // ---------- FAQ: animated open/close ----------
  function setupFaq(gsap) {
    $$(".faq details").forEach((d) => {
      const summary = $("summary", d);
      const body = $(".answer", d);
      summary.addEventListener("click", (e) => {
        if (!gsap || reduceMotion) return;
        e.preventDefault();
        if (d.open) {
          gsap.to(body, { height: 0, duration: .5, ease: "expo.out", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); } });
          d.classList.remove("is-open");
          $(".plus", d).style.transform = "none";
        } else {
          d.open = true;
          gsap.fromTo(body, { height: 0 }, { height: "auto", duration: .7, ease: "expo.out" });
          gsap.from($("p", body), { y: 12, opacity: 0, duration: .6, ease: "expo.out" });
          $(".plus", d).style.transform = "";
        }
      });
    });
  }

  // ---------- Nav: hide on scroll down, switch colors over light sections ----------
  function setupNav() {
    const nav = $("#nav");
    let lastY = scrollY;
    const update = () => {
      const y = scrollY;
      nav.classList.toggle("is-hidden", y > lastY && y > 300);
      nav.classList.toggle("is-scrolled", y > 40);
      lastY = y;
      const under = document.elementsFromPoint(innerWidth / 2, 42).find((el) => el.closest("main section, footer"));
      const sec = under && under.closest("main section, footer");
      nav.classList.toggle("on-light", !!sec && sec.matches(".how, .faq-sec"));
    };
    update();
    addEventListener("scroll", update, { passive: true });
  }

  function setupReveal() {
    const items = $$("[data-reveal]");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  }

  function showAllStatic() {
    $$("[data-reveal]").forEach((el) => el.classList.add("is-in"));
    $$(".art").forEach((el) => el.classList.add("is-in"));
    $$(".manifesto .mw").forEach((el) => el.classList.add("on"));
    fillCalendar();
    $(".loader")?.remove();
  }

  // =================================================================
  function animate() {
    const { gsap, ScrollTrigger, Lenis } = window;
    gsap.registerPlugin(ScrollTrigger);

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    scrollTo(0, 0);

    // Smooth scroll
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) });
    }));

    // ----- Intro: the logo pulses, the curtain lifts, the title surfaces letter by letter -----
    const chars = $$(".hero-title .ch");
    gsap.set(chars, { opacity: 0, yPercent: 60, filter: "blur(12px)" });
    gsap.set([".hero-sub", ".hero-form", "#nav"], { opacity: 0, y: 20 });
    gsap.set(".hero-beam", { opacity: 0 });
    gsap.set(".hero-scene", { opacity: 0, y: 120, rotateX: 34 });
    gsap.set([".float-card", ".hero-chip"], { opacity: 0, scale: .85 });
    lenis.stop();

    const intro = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => lenis.start() });
    intro
      .to(".loader-mark", { scale: .8, opacity: 0, duration: .6, ease: "power2.in" }, 1.1)
      .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, 1.4)
      .set(".loader", { display: "none" }, 2.4)
      .to(".hero-beam", { opacity: .9, duration: 2.4, ease: "power2.out" }, 1.8)
      .to(chars, { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 1.1, stagger: .035, ease: "power3.out" }, 2.1)
      .to([".hero-sub", ".hero-form", "#nav"], { opacity: 1, y: 0, duration: 1.1, stagger: .08 }, 2.5)
      .to(".hero-scene", { opacity: 1, y: 0, rotateX: 24, duration: 2, ease: "expo.out" }, 2.5)
      .to([".float-card", ".hero-chip"], { opacity: 1, scale: 1, duration: 1.1, stagger: .14, ease: "back.out(1.6)" }, 3.0);

    // ----- Hero: cards drift gently with the cursor (nothing moves on scroll) -----
    $$(".float-card, .hero-chip").forEach((el, i) =>
      gsap.to(el, { y: i % 2 ? 10 : -10, duration: 3 + i * .5, ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * .3 }));
    if (finePointer) {
      const layers = $$("[data-depth]").map((el) => [gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }), +el.dataset.depth]);
      const beamX = gsap.quickTo(".hero-beam", "x", { duration: 2, ease: "power3.out" });
      $(".hero").addEventListener("pointermove", (e) => {
        const nx = e.clientX / innerWidth - .5;
        layers.forEach(([fx, d]) => fx(nx * d * 18));
        beamX(nx * 80);
      });
    }

    // ----- Split headings -----
    $$("main [data-split]").forEach((el) => {
      gsap.from($$(".sw > span", el), {
        yPercent: 115, duration: 1.3, ease: "expo.out", stagger: .06,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // ----- How it works: pinned, three steps -----
    const steps = $$(".step");
    const layers = $$(".how .layer");
    const hFloats = $$(".how-float");
    const bar = $(".how-progress i");
    const typed = $(".typing .t");
    const fullText = typed.textContent;
    let current = -1, typer = 0;
    const typeIt = () => {
      clearInterval(typer);
      let n = 0;
      typed.textContent = "";
      typer = setInterval(() => { typed.textContent = fullText.slice(0, ++n); if (n >= fullText.length) clearInterval(typer); }, 38);
    };
    const go = (n) => {
      if (n === current) return;
      const prev = current;
      current = n;
      steps.forEach((s, k) => s.classList.toggle("is-active", k === n));
      hFloats.forEach((f, k) => f.classList.toggle("is-on", k === n));
      $(".rx-overlay")?.classList.toggle("is-on", n === 2);
      layers.forEach((l, k) => {
        if (k === n) gsap.fromTo(l, { opacity: 0, scale: 1.06, filter: "blur(6px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: .8, ease: "expo.out", overwrite: true });
        else if (k === prev) gsap.to(l, { opacity: 0, duration: .5, ease: "power2.out", overwrite: true });
        else gsap.set(l, { opacity: 0 });
      });
      gsap.fromTo(".how-stage .device", { rotationY: n > prev ? -10 : 10 }, { rotationY: 0, duration: 1.2, ease: "expo.out", transformPerspective: 1200 });
      if (n === 0) typeIt();
    };
    go(0);
    ScrollTrigger.create({
      trigger: ".how", start: "top top", end: "+=260%", pin: ".how-pin", anticipatePin: 1,
      onUpdate: (st) => {
        // steps play over the first 85%, then the last step rests so the release feels calm
        go(Math.min(2, Math.floor(Math.min(st.progress / .85, .999) * 3)));
        bar.style.transform = `scaleX(${.12 + Math.min(1, st.progress / .85) * .88})`;
      },
    });
    gsap.fromTo(".how-ring", { scale: .7 }, { scale: 1.08, ease: "none", scrollTrigger: { trigger: ".how", start: "top bottom", end: "+=320%", scrub: true } });

    // ----- Features: horizontal rail on desktop, swipe on mobile -----
    const cardIn = (card) => {
      const art = $(".art", card);
      if (!art || art.classList.contains("is-in")) return;
      art.classList.add("is-in");
      if (art.classList.contains("art-cal")) fillCalendar();
      const num = $(".num", art);
      if (num) gsap.fromTo(num, { textContent: 0 }, { textContent: Number(num.dataset.count), duration: 1.4, ease: "power2.out", snap: { textContent: 1 } });
    };
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const rail = $(".rail");
      const distance = () => rail.scrollWidth - innerWidth + parseFloat(getComputedStyle($(".rail-wrap")).paddingLeft) + 40;
      const scroller = gsap.to(rail, {
        x: () => -distance(), ease: "none",
        scrollTrigger: { trigger: ".features", start: "top top", end: () => "+=" + distance(), scrub: .6, invalidateOnRefresh: true },
      });
      // The pin lasts a little longer than the slide, so the rail settles before the page moves on.
      ScrollTrigger.create({ trigger: ".features", start: "top top", end: () => "+=" + (distance() + innerHeight * .35), pin: ".features-pin", anticipatePin: 1, invalidateOnRefresh: true });
      $$(".card").forEach((card) => {
        gsap.from(card, {
          y: 80, rotate: 3, opacity: .4, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: scroller, start: "left 105%", end: "left 65%", scrub: true },
        });
        ScrollTrigger.create({ trigger: card, containerAnimation: scroller, start: "left 75%", onEnter: () => cardIn(card) });
      });
    });
    mm.add("(max-width: 900px)", () => {
      const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && cardIn(e.target)), { root: $(".rail-wrap"), threshold: .5 });
      $$(".card").forEach((c) => io.observe(c));
      ScrollTrigger.create({ trigger: ".rail", start: "top 80%", once: true, onEnter: () => cardIn($(".card")) });
      return () => io.disconnect();
    });

    // ----- Manifesto: words light up with scroll -----
    const mws = $$(".manifesto .mw");
    ScrollTrigger.create({
      trigger: ".manifesto .big", start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: (st) => { const lit = Math.round(st.progress * mws.length); mws.forEach((w, k) => w.classList.toggle("on", k < lit)); },
    });

    // ----- CTA -----
    gsap.fromTo(".cta-glow", { scale: .7, opacity: .4 }, { scale: 1.1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });

    // ----- Footer wordmark rises -----
    gsap.from(".footer-word svg", { yPercent: 60, opacity: 0, ease: "expo.out", duration: 1.6, scrollTrigger: { trigger: ".footer-word", start: "top 95%" } });

    // ----- Magnetic buttons -----
    if (finePointer) {
      $$(".magnetic").forEach((btn) => {
        const x = gsap.quickTo(btn, "x", { duration: .6, ease: "elastic.out(1, .4)" });
        const y = gsap.quickTo(btn, "y", { duration: .6, ease: "elastic.out(1, .4)" });
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          x((e.clientX - r.left - r.width / 2) * .3);
          y((e.clientY - r.top - r.height / 2) * .4);
        });
        btn.addEventListener("pointerleave", () => { x(0); y(0); });
      });
    }

    // Layout settles once fonts and images are in.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    addEventListener("load", () => ScrollTrigger.refresh());
  }

  // ---------- Boot ----------
  renderQuestion($("[data-today]"));
  $$("[data-split]").forEach(split);
  $$("[data-chars]").forEach(splitChars);
  emojify();
  fitArt();
  addEventListener("resize", fitArt);
  document.fonts?.ready.then(fitArt);
  const mf = $("[data-manifesto]");
  if (mf) {
    const text = mf.textContent.trim();
    const hl = new Set(["one", "good", "question,"]);
    mf.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">` +
      text.split(/\s+/).map((w) => `<span class="mw${hl.has(w.toLowerCase()) ? " hl" : ""}">${esc(w)}</span>`).join(" ") + "</span>";
  }
  buildRiver();
  buildCalendar();
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  startCountdown();
  startTyping();
  setupSignup();
  setupNav();

  const libs = window.gsap && window.ScrollTrigger && window.Lenis;
  setupFaq(libs ? window.gsap : null);
  if (!libs || reduceMotion) {
    showAllStatic();
    return;
  }
  setupReveal();
  animate();
})();
