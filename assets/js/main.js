// Quesly — quesly.me. GSAP + ScrollTrigger + Lenis (vendored in assets/vendor).
(() => {
  "use strict";

  // Where waitlist emails go: any endpoint that accepts a JSON POST {email, source}
  // (Formspree, a Supabase Edge Function, Google Apps Script…). Empty = fall back to email.
  const SIGNUP_ENDPOINT = "";
  const CONTACT_EMAIL = "hello@quesly.me";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const desktop = () => matchMedia("(min-width: 901px)").matches;

  // ---------- Question of the day ----------
  // Mirrors Shared/QuestionBank.swift: index = (day ordinal since 0001-01-01) % count, local time.
  const QUESTIONS = [
    ["If you only had one day off, what would you do?", ["day off,", "you do?"]],
    ["What's a small thing that makes you happy every day?", ["happy"]],
    ["If you could live anywhere in the world, where would it be?", ["anywhere", "world,"]],
    ["If you had one superpower, what would it be?", ["superpower,"]],
    ["What's the best advice you've ever received?", ["best advice"]],
    ["Which song always puts you in a good mood?", ["song", "good mood?"]],
    ["What's something you're quietly proud of?", ["proud"]],
    ["What tiny moment made your week better?", ["tiny moment"]],
    ["What's one skill you'd love to learn this year?", ["skill"]],
    ["What meal feels like home to you?", ["home"]],
  ];
  const DAYS_BEFORE_1970 = 719163;
  const todayIndex = (now = new Date()) =>
    (Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5) + DAYS_BEFORE_1970) % QUESTIONS.length;

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  function renderQuestion(el) {
    const [text, highlights] = QUESTIONS[todayIndex()];
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
        return `<span class="sw"><span>${inner}</span></span>`;
      }).join(" ") + "</span>";
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
      if (todayIndex(now) !== last) { last = todayIndex(now); renderQuestion($("[data-today]")); }
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

  // ---------- Answers wall ----------
  const ANSWERS = [
    ["Superpower", "Teleportation. No more 2-hour train rides to see my parents", "funnnnyyy1", 3, "❤️ 🥹"],
    ["Tiny joy", "First sip of coffee while everyone's still asleep", "alexo91", 2, "☕"],
    ["Live anywhere", "Lisbon. Sun, tiles and the sea", "leo.martin", 11, "🔥"],
    ["Best advice", "Done is better than perfect", "mr.smith", 4, "❤️ 🔥"],
    ["Good-mood song", "Dancing Queen, every single time", "AnnaViva", 7, "😂"],
    ["Quietly proud", "I finally learned to swim at 27", "camille_b", 12, "🥹 ❤️"],
    ["Meal like home", "Grandma's dumplings on a Sunday", "van.derss2", 1, "🥹"],
    ["Day off", "Phone off, long walk, good book", "nata.ver", 10, "❤️"],
    ["Superpower", "Pause time for 10 minutes every morning", "john.john", 5, "😂 🔥"],
    ["Skill to learn", "Film photography. Slow and real", "koko_lilly", 9, "🔥"],
    ["Tiny moment", "A stranger held the door and smiled", "yasmine.k", 13, "❤️"],
    ["Superpower", "Never get tired. Imagine the running PRs", "theo_runs", 14, "🔥 😂"],
    ["Live anywhere", "A cabin with a view and fast Wi-Fi", "chill_mara", 6, "😂"],
    ["Best advice", "Call your mom more often", "arturo_sun", 8, "🥹 ❤️"],
  ];
  function buildWall() {
    const card = ([q, a, user, av, rx]) => `<div class="answer-card"><p class="q">${q}</p><p class="who"><img src="assets/img/avatar-${av}.webp" alt="" width="28" height="28" loading="lazy">${user}</p><p>${esc(a)}</p><p class="rx">${rx}</p></div>`;
    $$(".wall-track").forEach((track, r) => {
      const list = r === 0 ? ANSWERS.slice(0, 7) : ANSWERS.slice(7);
      const html = list.map(card).join("");
      track.innerHTML = html + html; // doubled for a seamless loop
    });
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
          say("You're on the list 🎉 We'll email you when your invite is ready.", "ok");
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
      nav.classList.toggle("on-light", !!sec && sec.matches(".today, .how, .wall, .faq-sec"));
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

    // ----- Intro -----
    const heroWords = $$(".hero-title .sw > span");
    const floats = $$(".hero .float");
    gsap.set(heroWords, { yPercent: 115 });
    gsap.set(".hero-device .tilt", { y: "60vh", rotationX: 40, rotationY: -30, rotationZ: 10 });
    gsap.set(floats.map((f) => f.firstElementChild), { scale: 0, opacity: 0 });
    gsap.set(".ring-b", { rotate: -200, scale: .6, opacity: 0 });
    gsap.set([".hero-bottom", "#nav"], { opacity: 0, y: 24 });
    lenis.stop();

    const intro = gsap.timeline({ defaults: { ease: "expo.out" }, onComplete: () => lenis.start() });
    intro
      .to(".loader-mark", { scale: .6, opacity: 0, duration: .5, ease: "power3.in" }, .9)
      .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, 1.1)
      .set(".loader", { display: "none" })
      .to(".ring-b", { rotate: -20, scale: 1, opacity: 1, duration: 2.2 }, 1.4)
      .to(heroWords, { yPercent: 0, duration: 1.4, stagger: .08 }, 1.5)
      .to(".hero-device .tilt", { y: 0, rotationX: 8, rotationY: -14, rotationZ: 4, duration: 2 }, 1.6)
      .to(floats.map((f) => f.firstElementChild), { scale: 1, opacity: 1, duration: 1.2, stagger: .08, ease: "back.out(1.6)" }, 2.1)
      .to([".hero-bottom", "#nav"], { opacity: 1, y: 0, duration: 1.2, stagger: .1 }, 2.2);

    // ----- Hero: pointer parallax -----
    if (finePointer) {
      const dev = $(".hero-device .device");
      const rx = gsap.quickTo(dev, "rotationX", { duration: .8, ease: "power3" });
      const ry = gsap.quickTo(dev, "rotationY", { duration: .8, ease: "power3" });
      const movers = floats.map((f) => ({ x: gsap.quickTo(f, "x", { duration: 1, ease: "power3" }), y: gsap.quickTo(f, "y", { duration: 1, ease: "power3" }), d: Number(f.dataset.depth) }));
      const titleX = gsap.quickTo(".hero-title", "x", { duration: 1.2, ease: "power3" });
      $(".hero").addEventListener("pointermove", (e) => {
        const px = e.clientX / innerWidth - .5;
        const py = e.clientY / innerHeight - .5;
        ry(px * 16); rx(-py * 12);
        movers.forEach((m) => { m.x(px * m.d); m.y(py * m.d); });
        titleX(-px * 24);
      });
    }

    // ----- Hero: scroll scene (title splits, phone straightens, feed unlocks) -----
    const feed = $(".layer-feed");
    gsap.set(feed, { opacity: 1, clipPath: "inset(100% 0% 0% 0%)" });
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: ".hero", start: "top top", end: "+=130%", pin: ".hero-pin", scrub: 1 },
      defaults: { ease: "none" },
    });
    // fromTo + immediateRender:false so the intro owns the start state until the first scroll.
    const ft = (t, from, to, at) => heroTl.fromTo(t, from, { ...to, immediateRender: false }, at);
    ft(".ht-1", { xPercent: 0, opacity: 1 }, { xPercent: -45, opacity: 0 }, 0);
    ft(".ht-2", { xPercent: 0, opacity: 1 }, { xPercent: 45, opacity: 0 }, 0);
    ft(".hero-device .tilt", { y: 0, rotationX: 8, rotationY: -14, rotationZ: 4, scale: 1 }, { y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: desktop() ? 1.18 : 1.08 }, 0);
    ft(".ring-b", { rotate: -20, scale: 1, opacity: 1 }, { rotate: 160, scale: 1.5, opacity: 1 }, 0);
    ft(".hero-bottom", { opacity: 1, y: 0 }, { opacity: 0, y: -20 }, 0);
    ft(feed, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .6 }, .3);
    floats.forEach((f, i) => {
      const side = f.getBoundingClientRect().left + f.offsetWidth / 2 < innerWidth / 2 ? -1 : 1;
      ft(f.firstElementChild, { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }, { x: side * (220 + i * 30), y: -120 - i * 40, rotate: side * 18, opacity: 0, scale: 1, duration: .7 }, .05 + i * .03);
    });

    // ----- Split headings -----
    $$("main [data-split]").forEach((el) => {
      if (el.closest(".hero")) return;
      gsap.from($$(".sw > span", el), {
        yPercent: 115, duration: 1.3, ease: "expo.out", stagger: .06,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // ----- Today's question -----
    const tq = $("[data-today]");
    const tqWords = $$(".sw > span", tq);
    gsap.set(tqWords, { yPercent: 115 });
    gsap.set($$("mark", tq), { "--hl": 0 });
    ScrollTrigger.create({
      trigger: tq, start: "top 85%", once: true,
      onEnter: () => {
        gsap.to(tqWords, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: .05 });
        gsap.to($$("mark", tq), { "--hl": 1, duration: 1, ease: "expo.inOut", delay: .6 });
      },
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
      trigger: ".how", start: "top top", end: "+=220%", pin: ".how-pin", scrub: true,
      onUpdate: (st) => {
        go(Math.min(2, Math.floor(st.progress * 3)));
        bar.style.transform = `scaleX(${.12 + st.progress * .88})`;
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
        scrollTrigger: { trigger: ".features", start: "top top", end: () => "+=" + distance(), pin: ".features-pin", scrub: 1, invalidateOnRefresh: true },
      });
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

    // ----- Answers wall: endless rows that speed up with scroll -----
    const loops = $$(".wall-track").map((track, r) =>
      gsap.fromTo(track, { xPercent: r ? -50 : 0 }, { xPercent: r ? 0 : -50, duration: 70, ease: "none", repeat: -1 }));
    ScrollTrigger.create({
      trigger: ".wall", start: "top bottom", end: "bottom top",
      onUpdate: (st) => {
        const boost = 1 + Math.min(6, Math.abs(st.getVelocity()) / 400);
        loops.forEach((l) => gsap.to(l, { timeScale: boost, duration: .2, overwrite: true, onComplete: () => gsap.to(l, { timeScale: 1, duration: 1.2 }) }));
      },
    });
    gsap.from(".wall-rows", { rotate: -3, scale: 1.08, ease: "none", scrollTrigger: { trigger: ".wall", start: "top bottom", end: "center center", scrub: true } });

    // ----- Manifesto: words light up with scroll -----
    const mws = $$(".manifesto .mw");
    ScrollTrigger.create({
      trigger: ".manifesto .big", start: "top 80%", end: "bottom 45%", scrub: true,
      onUpdate: (st) => { const lit = Math.round(st.progress * mws.length); mws.forEach((w, k) => w.classList.toggle("on", k < lit)); },
    });

    // ----- CTA -----
    gsap.fromTo(".ring-cta", { rotate: -40, yPercent: -10 }, { rotate: 60, yPercent: -40, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });

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
  const mf = $("[data-manifesto]");
  if (mf) {
    const text = mf.textContent.trim();
    const hl = new Set(["one", "good", "question,"]);
    mf.innerHTML = `<span class="sr-only">${esc(text)}</span><span aria-hidden="true">` +
      text.split(/\s+/).map((w) => `<span class="mw${hl.has(w.toLowerCase()) ? " hl" : ""}">${esc(w)}</span>`).join(" ") + "</span>";
  }
  buildWall();
  buildCalendar();
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  startCountdown();
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
