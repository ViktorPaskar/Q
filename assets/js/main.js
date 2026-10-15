// Quesly landing. No dependencies.
(() => {
  "use strict";

  // Where early-access emails go. Any endpoint that accepts a JSON POST {email} works
  // (Formspree, Supabase Edge Function, Google Apps Script…). Empty = fall back to email.
  const SIGNUP_ENDPOINT = "";
  const CONTACT_EMAIL = "hello@quesly.me";

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- Question of the day ----------
  // Mirrors Shared/QuestionBank.swift: index = (day ordinal since 0001-01-01) % count, in local time.
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
  const DAYS_BEFORE_1970 = 719163; // ordinal of 1970-01-01 in the proleptic Gregorian calendar

  function todayIndex(now = new Date()) {
    const localDays = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 864e5);
    return (localDays + DAYS_BEFORE_1970) % QUESTIONS.length;
  }

  function renderQuestion(el) {
    const [text, highlights] = QUESTIONS[todayIndex()];
    // Mark highlighted phrases, then split into words so they can rise in one by one.
    let i = 0;
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
    el.innerHTML = `<span class="sr-only">${text}</span><span aria-hidden="true">` + words.map((w, idx) => {
      const safe = w.replace(/&/g, "&amp;").replace(/</g, "&lt;");
      const inner = marked.has(idx) ? `<mark>${safe}</mark>` : safe;
      return `<span class="w" style="--i:${i++}">${inner}</span>`;
    }).join(" ") + "</span>";
  }

  function startCountdown() {
    const out = $$("[data-countdown]");
    if (!out.length) return;
    let lastIndex = todayIndex();
    const tick = () => {
      const now = new Date();
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const s = Math.max(0, Math.floor((next - now) / 1000));
      const pad = (n) => String(n).padStart(2, "0");
      const str = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
      out.forEach((el) => (el.textContent = str));
      if (todayIndex(now) !== lastIndex) {
        lastIndex = todayIndex(now);
        const q = $("[data-today]");
        if (q) { renderQuestion(q); q.classList.add("is-in"); }
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const items = $$(".reveal, [data-today]");
    if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  // ---------- Nav ----------
  function setupNav() {
    const nav = $("#nav");
    if (!nav || nav.classList.contains("solid")) return;
    const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  // ---------- Hero: parallax + cycling screen ----------
  function setupHero() {
    const hero = $(".hero");
    if (!hero) return;
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-in")));

    $$("[data-cycle]").forEach((box) => {
      const imgs = $$("img", box);
      if (imgs.length < 2 || reduceMotion) return;
      let i = 0;
      setInterval(() => {
        if (document.hidden) return;
        imgs[i].classList.remove("is-on");
        i = (i + 1) % imgs.length;
        imgs[i].classList.add("is-on");
      }, Number(box.dataset.cycle) || 4000);
    });

    if (reduceMotion || !matchMedia("(pointer: fine)").matches) return;
    const layers = $$("[data-depth]", hero);
    const arc = $(".hero-arc", hero);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      layers.forEach((el) => {
        const d = Number(el.dataset.depth);
        el.style.setProperty("--px", `${(cx * d).toFixed(2)}px`);
        el.style.setProperty("--py", `${(cy * d).toFixed(2)}px`);
      });
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(loop) : 0;
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    addEventListener("scroll", () => {
      if (arc && scrollY < innerHeight * 1.2) arc.style.setProperty("--arc-y", `${scrollY * 0.25}px`);
    }, { passive: true });
  }

  // ---------- How it works: sticky phone follows the active step ----------
  function setupHow() {
    const steps = $$(".how-step");
    const screens = $$("[data-how-screens] img");
    if (!steps.length || !("IntersectionObserver" in window)) return;
    const activate = (n) => {
      steps.forEach((s, k) => s.classList.toggle("is-active", k === n));
      screens.forEach((img, k) => img.classList.toggle("is-on", k === n));
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activate(Number(e.target.dataset.step)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach((s) => io.observe(s));
  }

  // ---------- Manifesto: words light up as you scroll ----------
  function setupManifesto() {
    const el = $("[data-manifesto]");
    if (!el) return;
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = `<span class="sr-only">${el.textContent.trim()}</span>` +
      words.map((w) => `<span class="reveal-word" aria-hidden="true">${w}</span>`).join(" ");
    const spans = $$(".reveal-word", el);
    if (reduceMotion) { spans.forEach((s) => s.classList.add("on")); return; }
    const update = () => {
      const r = el.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = Math.round(progress * spans.length);
      spans.forEach((s, k) => s.classList.toggle("on", k < lit));
    };
    update();
    addEventListener("scroll", update, { passive: true });
  }

  // ---------- Early access form ----------
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
          location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Quesly early access")}&body=${encodeURIComponent(`Please add ${email} to the Quesly beta.`)}`;
          say("Your email app should open. Just hit send.", "ok");
          return;
        }

        btn.disabled = true;
        say("Saving your spot…", "ok");
        try {
          const res = await fetch(SIGNUP_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email, source: form.closest("section")?.id || "site" }),
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

  // ---------- Boot ----------
  const q = $("[data-today]");
  if (q) renderQuestion(q);
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
  startCountdown();
  setupNav();
  setupHero();
  setupReveal();
  setupHow();
  setupManifesto();
  setupSignup();
})();
