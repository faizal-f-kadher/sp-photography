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
      if (lenis) { if (open) lenis.stop(); else lenis.start(); }
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
     SMOOTH SCROLLING (Lenis) — eases wheel/trackpad scrolling site-wide
     ------------------------------------------------------------------------ */
  var lenis = null;
  function initSmoothScroll() {
    if (!window.Lenis || reduceMotion) return;
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
    // in-page anchors glide too
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var t = $(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -70 });
      });
    });
  }

  /* ------------------------------------------------------------------------
     HERO — a layered gallery. Photographs float at three depths around one
     centre photograph. On scroll each depth drifts outward at its own speed
     (near = fast, far = slow) while the centre photograph opens to fill the
     screen; the mouse tilts the depths gently on desktop.
     Without motion it is simply the composed still.
     ------------------------------------------------------------------------ */
  /* Photographs the hero picks from (each visit shows a different mix, and they keep changing) */
  var HERO_POOL = [
    ["weddings/weddings-08", "A bride and groom under the chandeliers of a wedding hall"],
    ["weddings/weddings-02", "A bride's hands with mehendi and bangles"],
    ["weddings/weddings-04", "A bride and groom with garlands among palms"],
    ["weddings/weddings-10", "A couple resting on temple steps"],
    ["weddings/weddings-11", "A couple in silk beside a carved pillar"],
    ["couples/couples-34", "A couple by a forest stream"],
    ["couples/couples-41", "A couple outside a street-corner shop"],
    ["couples/couples-12", "A couple close together, smiling"],
    ["couples/couples-01", "A couple with a horse by a hill lake"],
    ["couples/couples-21", "A couple at the window of a red bus"],
    ["couples/couples-38", "A couple outside a temple gopuram"],
    ["couples/couples-33", "A couple in a riverside embrace"],
    ["bridal/bridal-35", "A bride in temple jewellery"],
    ["bridal/bridal-23", "A bride in a green silk saree"],
    ["bridal/bridal-29", "A bride in pink and gold"],
    ["bridal/bridal-02", "A bride adjusting her earring"],
    ["bridal/bridal-12", "A bride in blue with jasmine in her hair"],
    ["portraits/portraits-06", "A portrait in red with an emerald necklace"],
    ["portraits/portraits-14", "A portrait with sparklers at night"],
    ["portraits/portraits-18", "A portrait in a red saree beside a tree"],
    ["portraits/portraits-31", "A portrait in a yellow and magenta saree"],
    ["maternity/maternity-04", "An expecting couple"],
    ["maternity/maternity-07", "An expecting couple with a vintage camera"],
    ["family/family-01", "Parents holding their son"],
    ["family/family-12", "Three generations in silk"],
    ["family/family-07", "A baby's first-birthday portrait"],
  ];
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function heroSrc(p) { return (window.HERO_BASE || "") + "public/images/" + p + "-sm.webp"; }

  function initHero() {
    var el = $(".hero");
    if (!el || !hasGsap || reduceMotion) return;
    var stage = $("[data-stage]", el), main = $("[data-main]", el), mainImg = $("[data-main-img]", el);
    var slot = $("[data-slot]", el), veil = $("[data-veil]", el);
    var l = $("[data-l] > span", el), r = $("[data-r] > span", el);

    var mm = gsap.matchMedia();
    mm.add({ mobile: "(max-width: 760px)", desktop: "(min-width: 761px)" }, function (ctx) {
      var mobile = ctx.conditions.mobile;
      el.classList.add("is-cinematic");
      var floats = $$("[data-fl]", el).filter(function (f) { return getComputedStyle(f).display !== "none"; });
      var photos = floats.filter(function (f) { return !f.hasAttribute("data-vec"); });
      var W = function () { return stage.clientWidth; }, H = function () { return stage.clientHeight; };
      var inner = function (f) { return f.querySelector(".fl__m"); };

      // a different mix of photographs on every visit
      var deck = shuffle(HERO_POOL.filter(function (p) { return p[0] !== window.HERO_CENTER; })), shown = [];
      photos.forEach(function (f, n) {
        var img = $("img", f), pick = deck[n];
        img.src = heroSrc(pick[0]); img.alt = pick[1]; shown.push(pick[0]);
      });

      // slow drift: each element wanders left→right, right→left, inward or outward, at its own pace
      var modes = ["lr", "rl", "in", "out"], drifts = [];
      floats.forEach(function (f) {
        var d = parseFloat(f.getAttribute("data-depth")) || 0.7;
        var b = f.getBoundingClientRect(), sb = stage.getBoundingClientRect();
        var cx = (b.left + b.width / 2 - sb.left) - sb.width / 2, cy = (b.top + b.height / 2 - sb.top) - sb.height / 2;
        var len = Math.hypot(cx, cy) || 1, A = (mobile ? 8 : 14) + (mobile ? 14 : 30) * d;
        var mode = modes[Math.floor(Math.random() * modes.length)];
        var dx = mode === "lr" ? A : mode === "rl" ? -A : (mode === "in" ? -1 : 1) * A * cx / len;
        var dy = mode === "lr" || mode === "rl" ? (Math.random() - 0.5) * A * 0.3 : (mode === "in" ? -1 : 1) * A * cy / len;
        var rot = f.hasAttribute("data-vec") ? (Math.random() - 0.5) * 16 : (Math.random() - 0.5) * 2.4;
        drifts.push(gsap.fromTo(f.firstElementChild,
          { x: -dx / 2, y: -dy / 2, rotation: -rot / 2 },
          { x: dx / 2, y: dy / 2, rotation: rot / 2, duration: gsap.utils.random(9, 17), ease: "sine.inOut", yoyo: true, repeat: -1, delay: -Math.random() * 8 }));
      });

      // now and then one photograph quietly changes to another from the studio's work
      var lastSwap = null, st = null;
      var swapTimer = setInterval(function () {
        if (document.hidden || (st && st.progress > 0.02)) return;
        var choices = photos.filter(function (f) { return f !== lastSwap; });
        var f = choices[Math.floor(Math.random() * choices.length)];
        var next = deck.filter(function (p) { return shown.indexOf(p[0]) < 0; });
        if (!f || !next.length) return;
        var pick = next[Math.floor(Math.random() * next.length)], box = inner(f), old = $("img", box);
        var img = new Image(); img.alt = pick[1]; img.decoding = "async";
        img.onload = function () {
          var target = getComputedStyle(old).opacity;
          box.appendChild(img);
          gsap.fromTo(img, { opacity: 0, scale: 1.06 }, { opacity: target, scale: 1, duration: 1.6, ease: "power2.inOut", onComplete: function () { old.remove(); gsap.set(img, { clearProps: "opacity" }); } });
          shown[shown.indexOf(old.getAttribute("src").replace(/^.*images\//, "").replace("-sm.webp", ""))] = pick[0];
        };
        img.src = heroSrc(pick[0]); lastSwap = f;
      }, 4200);

      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el, start: "top top",
          end: function () { return "+=" + H() * (mobile ? 1.25 : 1.6); },
          pin: stage, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: function (self) {
            var dark = self.progress > 0.55;
            if (dark !== (stage.getAttribute("data-dark") === "true")) {
              stage.setAttribute("data-dark", dark ? "true" : "false");
              window.dispatchEvent(new Event("header:check"));
            }
          },
        },
      });

      st = tl.scrollTrigger;
      // 1 — the small things leave first
      tl.to($$("[data-cta], [data-cue], [data-kick]", el), { autoAlpha: 0, y: -12, duration: 0.25, ease: "power1.in" }, 0)
        .to($$("[data-vf], [data-orbit]", el), { autoAlpha: 0, scale: 1.15, duration: 0.35, ease: "power1.in" }, 0)
        .to($("[data-fade]", el), { autoAlpha: 0, duration: 0.22 }, 0.6); // stays until the centre photo reaches the top

      // 2 — every depth drifts out from the centre at its own speed
      floats.forEach(function (f) {
        var d = parseFloat(f.getAttribute("data-depth")) || 0.7;
        var b = f.getBoundingClientRect(), sb = stage.getBoundingClientRect();
        var vx = (b.left + b.width / 2 - sb.left) / sb.width - 0.5;
        var vy = (b.top + b.height / 2 - sb.top) / sb.height - 0.5;
        tl.to(f, {
          x: function () { return vx * W() * 1.5 * d; },
          y: function () { return (vy * 1.1 - 0.35) * H() * d; },
          scale: 1 + 0.35 * d,
          duration: 1, ease: "power1.in",
        }, 0);
      });

      // 3 — the words part to either side (above and below on phones)
      var part = function (v) { v.autoAlpha = 0; v.duration = 0.55; v.ease = "power1.in"; return v; };
      tl.to(l, part(mobile ? { yPercent: -60 } : { xPercent: -35 }), 0.05)
        .to(r, part(mobile ? { yPercent: 60 } : { xPercent: 35 }), 0.05);

      // 4 — the centre photograph opens to fill the screen; inside it, the picture settles (parallax)
      tl.fromTo(main,
        { width: function () { return slot.offsetWidth; }, height: function () { return slot.offsetHeight; }, borderRadius: 3 },
        { width: function () { return W(); }, height: function () { return H(); }, borderRadius: 0, duration: 1, ease: "power2.inOut" }, 0.1)
        .fromTo(mainImg, { scale: 1.14 }, { scale: 1, duration: 1.1, ease: "power1.out" }, 0)
        .to(veil, { autoAlpha: 1, duration: 0.3 }, 0.92)
        .fromTo(veil.children, { y: 26 }, { y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" }, 0.92)
        .to({}, { duration: 0.3 }); // a moment to read before the page moves on

      // establishing shot on load: photographs develop in, the words rise
      var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro.fromTo(main, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, clearProps: "clipPath" }, 0)
        .from(mainImg, { scale: 1.3, duration: 2.2 }, 0)
        .from(photos.map(inner), { autoAlpha: 0, yPercent: 18, duration: 1.6, stagger: { each: 0.07, from: "center" }, clearProps: "opacity,visibility" }, 0.35)
        .from($$("[data-vf], [data-orbit]", el), { autoAlpha: 0, duration: 1.6, stagger: 0.1, ease: "power2.out" }, 0.9)
        .from([l, r], { y: 40, autoAlpha: 0, duration: 1.5, stagger: 0.1 }, 0.5)
        .from($$("[data-cta], [data-cue], [data-kick]", el), { autoAlpha: 0, duration: 1 }, 1);

      // desktop: the depths respond gently to the mouse
      var off = null;
      if (!mobile && window.matchMedia("(hover: hover)").matches) {
        var movers = floats.map(function (f) {
          var d = parseFloat(f.getAttribute("data-depth")) || 0.7, m = inner(f);
          return { d: d, x: gsap.quickTo(m, "x", { duration: 1.2, ease: "power3.out" }), y: gsap.quickTo(m, "y", { duration: 1.2, ease: "power3.out" }) };
        });
        var onMove = function (e) {
          var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
          movers.forEach(function (m) { m.x(-nx * 46 * m.d); m.y(-ny * 30 * m.d); });
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        off = function () { window.removeEventListener("mousemove", onMove); };
      }

      return function () {
        if (off) off();
        clearInterval(swapTimer);
        drifts.forEach(function (t) { t.kill(); });
        el.classList.remove("is-cinematic");
        stage.removeAttribute("data-dark");
        gsap.set(main, { clearProps: "width,height,borderRadius,clipPath" });
      };
    });
  }

  /* ------------------------------------------------------------------------
     STUDIO INTRO — the statement lights up word by word as you read;
     the two photographs drift at different speeds
     ------------------------------------------------------------------------ */
  function initStudioIntro() {
    var sec = $(".studio-in");
    if (!sec || !hasGsap || reduceMotion) return;
    var st = $("[data-words]", sec);
    if (st) {
      (function split(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.nodeValue.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement("span"); w.className = "w"; w.textContent = part; frag.appendChild(w);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) split(c);
        });
      })(st);
      st.classList.add("is-split");
      gsap.to($$(".w", st), {
        opacity: 1, ease: "none", stagger: 0.12,
        scrollTrigger: { trigger: st, start: "top 82%", end: "bottom 48%", scrub: 0.6 },
      });
    }
    var main = $("[data-si-main] img", sec), small = $("[data-si-small]", sec);
    var media = $(".studio-in__media", sec);
    if (main) gsap.fromTo(main, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true } });
    if (small) gsap.fromTo(small, { y: 60 }, { y: -60, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: true } });
    if (media) gsap.from(media, { clipPath: "inset(12% 0% 12% 0%)", opacity: 0, duration: 1.4, ease: "expo.out", clearProps: "clipPath", scrollTrigger: { trigger: media, start: "top 85%", once: true } });
  }

  /* ------------------------------------------------------------------------
     PACKAGES — desktop: pointing at a package opens its panel on the right;
     phones: tapping opens it below like an accordion (one at a time)
     ------------------------------------------------------------------------ */
  function initPackages() {
    var list = $("[data-pk-list]");
    if (!list) return;
    var items = $$("[data-pk]", list), wide = window.matchMedia("(min-width: 960px)");
    function open(it, scroll) {
      items.forEach(function (x) {
        var on = x === it;
        x.classList.toggle("is-open", on);
        $(".pk__head", x).setAttribute("aria-expanded", String(on));
      });
      if (!wide.matches && hasGsap && !reduceMotion) {
        var panel = $(".pk__panel", it);
        gsap.fromTo(panel, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.55, ease: "power2.out", clearProps: "height" });
        if (scroll && lenis) lenis.scrollTo($(".pk__head", it), { offset: -90, duration: 0.8 });
      }
    }
    items.forEach(function (it) {
      var head = $(".pk__head", it);
      head.addEventListener("mouseenter", function () { if (wide.matches && !it.classList.contains("is-open")) open(it); });
      head.addEventListener("focus", function () { if (wide.matches) open(it); });
      head.addEventListener("click", function () { if (!it.classList.contains("is-open")) open(it, true); });
    });
  }

  /* ------------------------------------------------------------------------
     PORTRAIT WALL — columns drift in opposite directions while scrolling
     ------------------------------------------------------------------------ */
  function initWall() {
    var wall = $("[data-wall]");
    if (!wall || !hasGsap || reduceMotion) return;
    $$(".sheet__col", wall).forEach(function (c, i) {
      var travel = function () { return Math.max(0, c.scrollHeight - wall.clientHeight); };
      var up = i % 2 === 0;
      gsap.fromTo(c,
        { y: function () { return up ? 0 : -travel(); } },
        { y: function () { return up ? -travel() * (i === 2 ? 0.75 : 1) : 0; }, ease: "none",
          scrollTrigger: { trigger: wall, start: "top bottom", end: "bottom top", scrub: 0.8, invalidateOnRefresh: true } });
    });
  }

  /* ------------------------------------------------------------------------
     REVIEWS — one at a time; moves on every 7 seconds, pauses on hover/focus
     ------------------------------------------------------------------------ */
  function initReviews() {
    var box = $("[data-rv]");
    if (!box) return;
    var sec = box.closest("section"), items = $$("[data-rv-item]", box), now = $("[data-rv-now]", sec), bar = $("[data-rv-bar]", box);
    var i = 0, DUR = 7000, t0 = 0, paused = false, left = DUR, raf = 0, visible = false;
    function go(n) {
      items[i].classList.remove("is-on"); items[i].setAttribute("aria-hidden", "true");
      i = (n + items.length) % items.length;
      items[i].classList.add("is-on"); items[i].setAttribute("aria-hidden", "false");
      if (now) now.textContent = i + 1;
      left = DUR; t0 = performance.now();
    }
    function tick(t) {
      raf = requestAnimationFrame(tick);
      if (paused || !visible || reduceMotion) { t0 = t - (DUR - left); return; }
      left = DUR - (t - t0);
      if (bar) bar.style.transform = "scaleX(" + Math.min(1, 1 - left / DUR).toFixed(4) + ")";
      if (left <= 0) go(i + 1);
    }
    $("[data-rv-prev]", sec).addEventListener("click", function () { go(i - 1); });
    $("[data-rv-next]", sec).addEventListener("click", function () { go(i + 1); });
    sec.addEventListener("mouseenter", function () { paused = true; });
    sec.addEventListener("mouseleave", function () { paused = false; });
    sec.addEventListener("focusin", function () { paused = true; });
    sec.addEventListener("focusout", function () { paused = false; });
    // swipe on phones
    var sx = null;
    box.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); sx = null; });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { threshold: 0.3 }).observe(sec);
    else visible = true;
    t0 = performance.now(); raf = requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------------
     CHAPTER PANELS — the hovered/focused panel opens
     ------------------------------------------------------------------------ */
  function initPanels() {
    var wrap = $("[data-panels]");
    if (!wrap) return;
    var panels = $$(".panel", wrap);
    function activate(p) { panels.forEach(function (x) { x.classList.toggle("is-active", x === p); }); }
    panels.forEach(function (p) {
      p.addEventListener("mouseenter", function () { activate(p); });
      p.addEventListener("focus", function () { activate(p); });
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
      // size the photographs so heading + strip + footer fill exactly one screen
      var head = $(".film__head", el), foot = $(".film__foot", el), reel = $(".film__reel", el);
      var fit = function () {
        el.style.removeProperty("--film-h");
        var rs = getComputedStyle(reel);
        var used = head.offsetHeight + foot.offsetHeight + parseFloat(rs.paddingTop) + parseFloat(rs.paddingBottom)
          + parseFloat(getComputedStyle(track).paddingBottom);
        el.style.setProperty("--film-h", Math.max(220, el.clientHeight - used - 4) + "px");
      };
      fit();
      ScrollTrigger.addEventListener("refreshInit", fit);
      var dist = function () { return track.scrollWidth - window.innerWidth; };
      var tw = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      return function () { ScrollTrigger.removeEventListener("refreshInit", fit); el.style.removeProperty("--film-h"); tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); el.classList.remove("is-hfilm"); gsap.set(track, { clearProps: "transform" }); };
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

  initSmoothScroll();
  initHeader();
  initMenu();
  initHero();
  initStudioIntro();
  initPackages();
  initReviews();
  initWall();
  initPanels();
  initFilm();
  initMotion();
  initFilters();
  initForm();
  var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();
  // measure every scroll effect again once pins, fonts and images have settled
  if (hasGsap) {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }
})();
