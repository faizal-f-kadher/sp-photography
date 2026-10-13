/* ==========================================================================
   Shaiprasath Photography — site behaviour (plain JavaScript)
   Needs: js/vendor/gsap.min.js and js/vendor/ScrollTrigger.min.js loaded first.
   Every feature checks for its own markup, so one file serves all pages.
   ========================================================================== */
(function () {
  "use strict";

  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------------------------------------------------
     SETTINGS — edit these
     ------------------------------------------------------------------------ */
  var SETTINGS = {
    /** JSON POST endpoint for the enquiry form (Formspree, Web3Forms…). Empty = not connected. */
    formEndpoint: "",
    phone: "+91 95005 88836",
    phoneHref: "+919500588836",
  };

  /* ------------------------------------------------------------------------
     HEADER — colour follows what is under it; hides on scroll down
     ------------------------------------------------------------------------ */
  function initHeader() {
    var header = $(".header");
    if (!header) return;
    var lastY = window.scrollY, raf = 0;

    function check() {
      raf = 0;
      var y = window.scrollY, dark = false;
      $$("[data-dark]").forEach(function (n) {
        if (n.getAttribute("data-dark") !== "true") return;
        var r = n.getBoundingClientRect();
        if (r.top <= 34 && r.bottom >= 34) dark = true;
      });
      var hero = $(".hero");
      var inHero = !!$(".is-cinematic") && hero && hero.getBoundingClientRect().bottom > 80;
      header.classList.toggle("is-dark", dark || header.classList.contains("menu-open"));
      header.classList.toggle("is-solid", y > 40 && !inHero && !header.classList.contains("menu-open"));
      var hide = !inHero && y > 400 && y > lastY + 4;
      if (y < lastY - 4 || y < 400) hide = false;
      if (hide) header.classList.add("is-hidden");
      else if (y < lastY - 4 || y < 400 || inHero) header.classList.remove("is-hidden");
      lastY = y;
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(check); }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("header:check", onScroll);
    setInterval(onScroll, 600);
    check();
  }

  /* ------------------------------------------------------------------------
     MOBILE MENU
     ------------------------------------------------------------------------ */
  function initMenu() {
    var btn = $(".menu-btn"), menu = $("#site-menu"), header = $(".header");
    if (!btn || !menu) return;
    var label = btn.firstChild;
    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", String(!open));
      if (open) menu.removeAttribute("inert"); else menu.setAttribute("inert", "");
      btn.setAttribute("aria-expanded", String(open));
      header.classList.toggle("menu-open", open);
      header.classList.toggle("is-dark", open);
      if (label && label.nodeType === 3) label.nodeValue = open ? "Close " : "Menu ";
      document.body.style.overflow = open ? "hidden" : "";
      if (open) { var first = $("a", menu); if (first) first.focus(); }
      window.dispatchEvent(new Event("header:check"));
    }
    btn.addEventListener("click", function () { setOpen(!menu.classList.contains("is-open")); });
    document.addEventListener("keydown", function (e) {
      if (!menu.classList.contains("is-open")) return;
      if (e.key === "Escape") { setOpen(false); btn.focus(); }
      if (e.key === "Tab") {
        var items = [btn].concat($$("a", menu));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  }

  /* ------------------------------------------------------------------------
     HERO — four chapters of one family's story, then the album.
     Each chapter's cut-out drifts past the camera while the next chapter
     opens through a temple-arch cut. Without motion it stays as stacked panels.
     ------------------------------------------------------------------------ */
  function initHero() {
    var el = $(".hero");
    if (!el || !hasGsap || reduceMotion) return;

    var HOLD = 0.55, MOVE = 1.15, STEP = HOLD + MOVE;
    var mm = gsap.matchMedia();

    mm.add({ mobile: "(max-width: 760px)", desktop: "(min-width: 761px)" }, function (ctx) {
      var mobile = ctx.conditions.mobile;
      el.classList.add("is-cinematic");
      var stage = $("[data-stage]", el);
      var scenes = $$("[data-scene]", el);
      var chapters = scenes.length - 1; // last one is the album
      var W = function () { return stage.clientWidth; };
      var H = function () { return stage.clientHeight; };
      var at = function (s, sel) { return s.querySelector(sel); };
      stage.setAttribute("data-dark", "true");

      function arch(s, closed) {
        var cut = at(s, "[data-cut]"), w, h;
        if (cut) {
          var cs = getComputedStyle(s);
          var ch = parseFloat(cs.getPropertyValue(mobile ? "--chm" : "--ch")) || 0.8;
          var ar = parseFloat(cs.getPropertyValue("--ar")) || 0.5;
          h = H() * ch * 0.92;
          w = Math.min(W() * 0.9, Math.max(H() * ch * ar * 0.9, W() * (mobile ? 0.5 : 0.18)));
        } else {
          w = Math.min(W() * (mobile ? 0.6 : 0.26), 420);
          h = H() * 0.6;
        }
        var left = (W() - w) / 2, top = closed ? H() : H() - h;
        return "inset(" + top + "px " + (W() - left - w) + "px 0px " + left + "px round " + w / 2 + "px " + w / 2 + "px 0px 0px)";
      }
      var open = "inset(0px 0px 0px 0px round 0px 0px 0px 0px)";

      scenes.forEach(function (s, i) { if (i > 0) gsap.set(s, { clipPath: arch(s, true) }); });

      // page-load entrance
      var s0 = scenes[0];
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from(at(s0, "[data-plate]"), { scale: 1.25, duration: 2.6, ease: "power3.out" }, 0)
        .from(at(s0, "[data-cut]"), { yPercent: 9, opacity: 0, duration: 1.8 }, 0.25)
        .from(at(s0, "[data-l] > span"), { xPercent: -24, opacity: 0, duration: 1.6 }, 0.55)
        .from(at(s0, "[data-r] > span"), { xPercent: 24, opacity: 0, duration: 1.6 }, 0.65)
        .from($$("[data-fg]", el), { scale: 1.3, opacity: 0, duration: 2, stagger: 0.15 }, 0.2)
        .from($$("[data-cta], [data-rail], [data-cue], [data-note]", el), { opacity: 0, duration: 1.2 }, 1.1);

      var rail = $$("[data-ri]", el), last = -1;
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el, start: "top top",
          end: function () { return "+=" + H() * (mobile ? 4.2 : 5.2); },
          pin: stage, scrub: mobile ? 0.6 : 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function () {
            var i = Math.min(chapters, Math.max(0, Math.round((tl.time() - HOLD - MOVE * 0.5) / STEP + 0.5)));
            if (i === last) return;
            rail.forEach(function (r, n) { r.toggleAttribute("data-active", n === i); });
            var dark = i < chapters;
            if (stage.getAttribute("data-dark") !== String(dark)) {
              stage.setAttribute("data-dark", String(dark));
              window.dispatchEvent(new Event("header:check"));
            }
            last = i;
          },
        },
      });

      var fg = $$("[data-fg]", el);
      tl.to($$("[data-cta], [data-cue]", el), { opacity: 0, y: -20, duration: 0.4 }, 0.1)
        .to(fg[0], { x: function () { return -W() * 0.35; }, y: function () { return H() * 0.25; }, scale: 1.6, duration: STEP }, 0)
        .to(fg[1], { x: function () { return W() * 0.3; }, y: function () { return -H() * 0.3; }, scale: 1.8, duration: STEP * 0.9 }, 0);

      scenes.forEach(function (s, i) {
        var plate = at(s, "[data-plate]");
        var born = i === 0 ? 0 : HOLD + (i - 1) * STEP;
        if (plate) tl.fromTo(plate, { scale: i === 0 ? 1.08 : 1.32 }, { scale: 1.02, duration: i === 0 ? STEP : STEP + MOVE, ease: "power1.out" }, born);

        if (i > 0) {
          tl.to(s, { keyframes: { clipPath: [arch(s, true), arch(s), open], easeEach: "power1.inOut" }, duration: MOVE, ease: "none" }, born);
          var cut = at(s, "[data-cut]");
          if (cut) {
            tl.fromTo(cut, { yPercent: 14, scale: 0.9 }, { yPercent: 0, scale: 1, duration: MOVE, ease: "power2.out" }, born + 0.1)
              .fromTo(at(s, "[data-l] > span"), { xPercent: -30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: MOVE * 0.7, ease: "power2.out" }, born + MOVE * 0.45)
              .fromTo(at(s, "[data-r] > span"), { xPercent: 30, opacity: 0 }, { xPercent: 0, opacity: 1, duration: MOVE * 0.7, ease: "power2.out" }, born + MOVE * 0.5)
              .fromTo(at(s, "[data-note]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, born + MOVE * 0.8);
          }
        }

        if (i < chapters) {
          var leave = HOLD + i * STEP, dir = i % 2 ? 1 : -1;
          tl.to(at(s, "[data-cut]"), { scale: 1.28, xPercent: dir * 22, yPercent: -4, opacity: 0, filter: mobile ? "none" : "blur(10px)", duration: MOVE * 0.85, ease: "power1.in" }, leave)
            .to(at(s, "[data-l] > span"), { xPercent: -40, opacity: 0, duration: MOVE * 0.5, ease: "power1.in" }, leave)
            .to(at(s, "[data-r] > span"), { xPercent: 40, opacity: 0, duration: MOVE * 0.5, ease: "power1.in" }, leave)
            .to(at(s, "[data-note]"), { opacity: 0, duration: 0.25 }, leave);
        }
      });

      var albumAt = HOLD + (chapters - 1) * STEP;
      tl.fromTo($$("[data-aitem]", el), { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power2.out" }, albumAt + MOVE * 0.4)
        .fromTo($$("[data-acopy] > *", el), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power2.out" }, albumAt + MOVE * 0.5)
        .to($$("[data-rail]", el), { opacity: 0, duration: 0.3 }, albumAt + MOVE)
        .to({}, { duration: 0.5 });

      return function () {
        el.classList.remove("is-cinematic");
        stage.removeAttribute("data-dark");
        scenes.forEach(function (s) { gsap.set(s, { clearProps: "clipPath" }); });
      };
    });
  }

  /* ------------------------------------------------------------------------
     FILM STRIP — featured story travels sideways on desktop
     ------------------------------------------------------------------------ */
  function initFilm() {
    var el = $(".film"), track = el && $(".film__track", el);
    if (!track || !hasGsap || reduceMotion) return;
    gsap.matchMedia().add("(min-width: 900px)", function () {
      el.classList.add("is-hfilm");
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var tw = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      return function () { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); el.classList.remove("is-hfilm"); gsap.set(track, { clearProps: "transform" }); };
    });
  }

  /* ------------------------------------------------------------------------
     SCROLL REVEALS — data-reveal, data-mask, data-parallax, path.draw
     ------------------------------------------------------------------------ */
  function initMotion() {
    if (!hasGsap || reduceMotion) return;
    var main = $("#main");
    if (main) gsap.from(main, { opacity: 0, y: 14, duration: 0.8, ease: "power2.out", clearProps: "transform,opacity" });

    $$("[data-reveal]").forEach(function (n) {
      if (n.closest(".hero")) return;
      gsap.from(n, { y: 34, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: n, start: "top 90%", once: true } });
    });
    $$("[data-mask]").forEach(function (n) {
      if (n.closest(".hero")) return;
      var img = $("img", n);
      var tl = gsap.timeline({ scrollTrigger: { trigger: n, start: "top 88%", once: true } });
      tl.fromTo(n, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.out" });
      if (img) tl.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
    });
    $$("[data-parallax]").forEach(function (n) {
      var v = parseFloat(n.getAttribute("data-parallax") || "0.12");
      gsap.fromTo(n, { yPercent: -v * 50 }, { yPercent: v * 50, ease: "none", scrollTrigger: { trigger: n.parentElement || n, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("path.draw").forEach(function (p) {
      var len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", scrollTrigger: { trigger: p.ownerSVGElement || p, start: "top 92%", once: true } });
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    setTimeout(function () { ScrollTrigger.refresh(); }, 400);
  }

  /* ------------------------------------------------------------------------
     STORIES FILTER
     ------------------------------------------------------------------------ */
  function initFilters() {
    var group = $(".filters"), grid = $(".journal[data-filterable]");
    if (!group || !grid) return;
    var live = $("[data-count]");
    $$("button", group).forEach(function (b) {
      b.addEventListener("click", function () {
        var kind = b.getAttribute("data-kind");
        $$("button", group).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        function apply() {
          var n = 0;
          $$(".story-card", grid).forEach(function (c) {
            var show = kind === "All" || c.getAttribute("data-kind") === kind;
            c.hidden = !show; if (show) n++;
          });
          if (live) live.textContent = n + " stories shown";
          if (hasGsap) ScrollTrigger.refresh();
        }
        if (!hasGsap || reduceMotion) return apply();
        gsap.to(grid, { opacity: 0, y: 16, duration: 0.25, ease: "power1.in", onComplete: function () {
          apply();
          gsap.fromTo(grid, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        } });
      });
    });
  }

  /* ------------------------------------------------------------------------
     ENQUIRY FORM — validates; reports success only after a 2xx response
     ------------------------------------------------------------------------ */
  function initForm() {
    var form = $("form.form");
    if (!form) return;
    var status = $("[data-status]", form);
    var preset = new URLSearchParams(location.search).get("type");
    if (preset) { var r = $('input[name="type"][data-slug="' + preset + '"]', form); if (r) r.checked = true; }
    var dateInput = $("#date", form);
    if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

    function setErr(key, msg) {
      var e = $("#" + key + "-err", form);
      if (e) e.textContent = msg || "";
      var fields = key === "contact" ? ["email", "phone"] : [key];
      fields.forEach(function (f) {
        var inp = form.elements[f];
        if (!inp || inp.length) return;
        if (msg) { inp.setAttribute("aria-invalid", "true"); inp.setAttribute("aria-describedby", key + "-err"); }
        else { inp.removeAttribute("aria-invalid"); }
      });
    }
    function show(html, ok) {
      status.innerHTML = '<p class="form__status' + (ok ? " form__status--ok" : "") + '">' + html + "</p>";
      status.focus();
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      if (d.get("company")) return;
      var name = String(d.get("name") || "").trim();
      var email = String(d.get("email") || "").trim();
      var phone = String(d.get("phone") || "").trim();
      var errs = {};
      if (name.length < 2) errs.name = "Please tell us your name.";
      if (!email && !phone) errs.contact = "Add an email address or a phone number so we can reply.";
      else if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.contact = "That email address doesn't look quite right.";
      else if (phone && phone.replace(/\D/g, "").length < 8) errs.contact = "Please check the phone number.";
      if (!d.get("type")) errs.type = "Choose the kind of photography.";
      if (String(d.get("message") || "").trim().length < 10) errs.message = "A sentence or two helps us reply properly.";
      ["name", "contact", "type", "message"].forEach(function (k) { setErr(k, errs[k]); });
      var keys = Object.keys(errs);
      if (keys.length) {
        var f = form.elements[keys[0] === "contact" ? "email" : keys[0]];
        if (f && f.focus) f.focus(); else if (f && f[0]) f[0].focus();
        return;
      }
      if (!SETTINGS.formEndpoint) {
        show("Online enquiries aren't connected yet, so this message has <strong>not</strong> been sent. Please call the studio on <a href=\"tel:" + SETTINGS.phoneHref + "\" style=\"text-decoration:underline\">" + SETTINGS.phone + "</a> instead.");
        return;
      }
      var btn = $("button[type=submit]", form);
      btn.disabled = true; btn.setAttribute("aria-busy", "true");
      var payload = {}; d.forEach(function (v, k) { payload[k] = v; });
      payload._subject = "New enquiry — " + payload.type;
      fetch(SETTINGS.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          show("Thank you — your enquiry has been sent. We'll be in touch personally.", true);
        })
        .catch(function () { show("Your message could not be sent just now. Please try again in a moment."); })
        .finally(function () { btn.disabled = false; btn.removeAttribute("aria-busy"); });
    });
  }

  initHeader();
  initMenu();
  initHero();
  initFilm();
  initMotion();
  initFilters();
  initForm();
  var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
})();
