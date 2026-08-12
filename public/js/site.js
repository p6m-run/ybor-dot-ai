/* ==========================================================================
   Ybor.ai Marketing Site — shared interactions
   ========================================================================== */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ---- Theme toggle (light / dark) ---- */
    (function () {
      var root = document.documentElement;
      function current() {
        return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      }
      function apply(theme, persist) {
        root.setAttribute("data-theme", theme);
        if (persist) { try { localStorage.setItem("ybor-theme", theme); } catch (e) {} }
        document.querySelectorAll(".theme-toggle").forEach(function (b) {
          b.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
          b.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
        });
      }
      function makeToggle() {
        var btn = document.createElement("button");
        btn.className = "theme-toggle";
        btn.type = "button";
        btn.innerHTML =
          '<i data-lucide="moon" class="ti-moon"></i>' +
          '<i data-lucide="sun" class="ti-sun"></i>';
        btn.addEventListener("click", function () {
          apply(current() === "dark" ? "light" : "dark", true);
        });
        return btn;
      }
      var header = document.querySelector(".header-inner");
      var hamburger = document.getElementById("hamburger");
      if (header) {
        var t = makeToggle();
        if (hamburger) header.insertBefore(t, hamburger);
        else header.appendChild(t);
      }
      apply(current(), false);

      /* track system preference only when the user hasn't chosen explicitly */
      var stored = null;
      try { stored = localStorage.getItem("ybor-theme"); } catch (e) {}
      if (!stored && window.matchMedia) {
        var mq = window.matchMedia("(prefers-color-scheme: dark)");
        var onChange = function (e) {
          var s = null;
          try { s = localStorage.getItem("ybor-theme"); } catch (err) {}
          if (!s) root.setAttribute("data-theme", e.matches ? "dark" : "light");
        };
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else if (mq.addListener) mq.addListener(onChange);
      }
    })();

    /* ---- Solid CTA expanding-chevron interaction ---- */
    (function () {
      var CHEV =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"' +
        ' stroke="currentColor" stroke-width="2" stroke-linecap="round"' +
        ' stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
      document.querySelectorAll(".btn-primary, .btn-dark, .btn-onpurple").forEach(function (btn) {
        if (btn.dataset.fx) return;
        var label = (btn.textContent || "").replace(/\s+/g, " ").trim();
        if (!label) return; // skip icon-only buttons
        btn.dataset.fx = "1";
        btn.classList.add("btn-fx");
        btn.textContent = "";
        var span = document.createElement("span");
        span.className = "btn-fx-label";
        span.textContent = label;
        var chev = document.createElement("i");
        chev.className = "btn-fx-chev";
        chev.setAttribute("aria-hidden", "true");
        chev.innerHTML = CHEV;
        btn.appendChild(span);
        btn.appendChild(chev);
      });
    })();

    /* ---- Lucide icons ---- */
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    /* ---- Desktop nav dropdowns (click + hover via CSS) ---- */
    var navItems = document.querySelectorAll(".nav-item.has-dd");
    navItems.forEach(function (item) {
      var btn = item.querySelector(".nav-link");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = item.classList.contains("open");
        navItems.forEach(function (i) { i.classList.remove("open"); });
        if (!wasOpen) item.classList.add("open");
      });
    });
    document.addEventListener("click", function () {
      navItems.forEach(function (i) { i.classList.remove("open"); });
    });

    /* ---- Mobile menu ---- */
    var mm = document.getElementById("mobileMenu");
    var openBtn = document.getElementById("hamburger");
    var closeBtn = document.getElementById("mmClose");
    function openMenu() { if (mm) { mm.classList.add("open"); document.body.style.overflow = "hidden"; } }
    function closeMenu() { if (mm) { mm.classList.remove("open"); document.body.style.overflow = ""; } }
    if (openBtn) openBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);

    /* ---- Mobile accordions ---- */
    document.querySelectorAll(".mm-acc-head").forEach(function (h) {
      h.addEventListener("click", function () {
        h.parentElement.classList.toggle("open");
      });
    });

    /* ---- Tabs ---- */
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll(".tab");
      var panels = group.querySelectorAll(".tabpanel");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
          panels.forEach(function (p) { p.classList.remove("active"); });
          tab.classList.add("active");
          tab.setAttribute("aria-selected", "true");
          var target = group.querySelector("#" + tab.dataset.target);
          if (target) target.classList.add("active");
        });
      });
    });

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".acc-head").forEach(function (head) {
      head.addEventListener("click", function () {
        var item = head.parentElement;
        var body = item.querySelector(".acc-body");
        var isOpen = item.classList.contains("open");
        if (isOpen) {
          item.classList.remove("open");
          body.style.maxHeight = null;
          head.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("open");
          body.style.maxHeight = body.scrollHeight + "px";
          head.setAttribute("aria-expanded", "true");
        }
      });
    });

    /* ---- Copy buttons ---- */
    document.querySelectorAll(".copy-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sel = btn.dataset.copy;
        var src = sel ? document.querySelector(sel) : null;
        var text = src ? src.innerText : (btn.dataset.text || "");
        var label = btn.querySelector("span");
        function flash() {
          if (label) { var old = label.textContent; label.textContent = "copied"; setTimeout(function () { label.textContent = old; }, 1400); }
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(flash).catch(flash);
        } else { flash(); }
      });
    });

    /* ---- Contact form validation ---- */
    var form = document.getElementById("contactForm");
    if (form) {
      var freeProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "aol.com", "proton.me"];
      var emailField = form.querySelector('[name="email"]');

      if (emailField) {
        emailField.addEventListener("input", function () {
          var wrap = emailField.closest(".field");
          var val = emailField.value.trim().toLowerCase();
          var domain = val.split("@")[1] || "";
          wrap.classList.toggle("warn", freeProviders.indexOf(domain) !== -1);
        });
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = true;
        form.querySelectorAll("[required]").forEach(function (el) {
          var wrap = el.closest(".field") || el.closest(".checkbox-row");
          var ok = el.type === "checkbox" ? el.checked : !!el.value.trim();
          if (el.type === "email" && ok) {
            ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
          }
          if (wrap && wrap.classList.contains("field")) wrap.classList.toggle("invalid", !ok);
          if (!ok) valid = false;
        });
        if (!valid) {
          var firstBad = form.querySelector(".field.invalid");
          if (firstBad) firstBad.scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
        form.style.display = "none";
        var success = document.getElementById("formSuccess");
        if (success) success.classList.add("show");
      });

      form.querySelectorAll("[required]").forEach(function (el) {
        el.addEventListener("input", function () {
          var wrap = el.closest(".field");
          if (wrap) wrap.classList.remove("invalid");
        });
        el.addEventListener("change", function () {
          var wrap = el.closest(".field");
          if (wrap) wrap.classList.remove("invalid");
        });
      });
    }

    /* ---- Newsletter (footer + blog) ---- */
    document.querySelectorAll("[data-newsletter]").forEach(function (nf) {
      nf.addEventListener("submit", function (e) {
        e.preventDefault();
        var inp = nf.querySelector("input");
        if (inp && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
          nf.innerHTML = '<span class="mono" style="font-size:13px;color:var(--green-dark)">// subscribed — check your inbox</span>';
        } else if (inp) {
          inp.style.borderColor = "var(--danger)";
        }
      });
    });

    /* ---- Intent param prefill on contact form ---- */
    var params = new URLSearchParams(window.location.search);
    var intent = params.get("intent");
    if (intent) {
      var intentSelect = document.getElementById("intentSelect");
      var intentField = document.getElementById("intentField");
      var map = {
        "demo": "Book a demo", "demo-infra": "Book a demo", "demo-app": "Book a demo",
        "architecture-demo": "Book a demo", "model": "Get started", "pricing": "Pricing",
        "soc2": "Security review", "soc2-type1": "Security review", "security-review": "Security review",
        "careers": "Careers", "partner": "Partner", "press": "Press"
      };
      if (intentSelect && map[intent]) {
        for (var i = 0; i < intentSelect.options.length; i++) {
          if (intentSelect.options[i].value === map[intent]) { intentSelect.selectedIndex = i; break; }
        }
        if (intentField) intentField.style.display = "none";
      }
      var banner = document.getElementById("intentBanner");
      if (banner && map[intent]) {
        banner.style.display = "flex";
        var lbl = banner.querySelector("[data-intent-label]");
        if (lbl) lbl.textContent = map[intent];
      }
    }

    /* ---- Reveal on scroll (respects reduced motion) ---- */
    var reveals = document.querySelectorAll(".reveal");
    if (reveals.length) {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var showAll = function () { reveals.forEach(function (r) { r.classList.add("in"); }); };
      if (reduce || !("IntersectionObserver" in window)) {
        showAll();
      } else {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
          });
        }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
        reveals.forEach(function (r) { io.observe(r); });
        // Immediate pass: anything already in the viewport reveals now.
        requestAnimationFrame(function () {
          var vh = window.innerHeight || document.documentElement.clientHeight;
          reveals.forEach(function (r) {
            var rect = r.getBoundingClientRect();
            if (rect.top < vh * 0.95) { r.classList.add("in"); io.unobserve(r); }
          });
        });
        // Safety net: never leave content hidden.
        setTimeout(showAll, 1500);
      }
    }
    /* ---- Flickering-grid hero backdrop ---- */
    (function () {
      var heroes = document.querySelectorAll("section.hero");
      if (!heroes.length || !("requestAnimationFrame" in window)) return;

      var reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function hexToRgb(hex) {
        hex = (hex || "").trim().replace("#", "");
        if (hex.length === 3) hex = hex.replace(/./g, "$&$&");
        var n = parseInt(hex, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
      }

      function brandRgb() {
        var cs = getComputedStyle(document.documentElement);
        var key = document.body.classList.contains("yinfra") ? "--orange"
                : document.body.classList.contains("yapp")   ? "--green-dark"
                : "--purple";
        return hexToRgb(cs.getPropertyValue(key) || "#8C64DA");
      }

      function build(hero) {
        var canvas = document.createElement("canvas");
        canvas.className = "hero-flicker";
        canvas.setAttribute("aria-hidden", "true");
        var ctx = canvas.getContext("2d");
        if (!ctx) return;
        hero.insertBefore(canvas, hero.firstChild);

        var SQUARE = 4, GAP = 4, FLICKER = 0.14;
        var rgb = brandRgb();
        var prefix = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",";
        var maxOp = document.documentElement.getAttribute("data-theme") === "dark" ? 0.26 : 0.17;
        var cols = 0, rows = 0, squares = null, dpr = 1, raf = 0, inView = false, last = 0;

        function setup() {
          var w = hero.clientWidth, h = hero.clientHeight;
          if (!w || !h) return;
          dpr = window.devicePixelRatio || 1;
          canvas.width = Math.max(1, Math.floor(w * dpr));
          canvas.height = Math.max(1, Math.floor(h * dpr));
          canvas.style.width = w + "px";
          canvas.style.height = h + "px";
          cols = Math.floor(w / (SQUARE + GAP));
          rows = Math.floor(h / (SQUARE + GAP));
          squares = new Float32Array(cols * rows);
          for (var i = 0; i < squares.length; i++) squares[i] = Math.random() * maxOp;
          draw();
        }

        function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          var step = (SQUARE + GAP) * dpr, size = SQUARE * dpr;
          for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
              ctx.fillStyle = prefix + squares[i * rows + j] + ")";
              ctx.fillRect(i * step, j * step, size, size);
            }
          }
        }

        function animate(t) {
          if (!inView) { raf = 0; return; }
          var dt = (t - last) / 1000; last = t;
          if (dt > 0 && dt < 1) {
            for (var i = 0; i < squares.length; i++) {
              if (Math.random() < FLICKER * dt) squares[i] = Math.random() * maxOp;
            }
            draw();
          }
          raf = requestAnimationFrame(animate);
        }

        setup();

        if (typeof ResizeObserver !== "undefined") {
          var rsz, ro = new ResizeObserver(function () {
            clearTimeout(rsz); rsz = setTimeout(setup, 120);
          });
          ro.observe(hero);
        }

        if (reduce) return; // static grid, no animation

        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
            if (inView && !raf) { last = performance.now(); raf = requestAnimationFrame(animate); }
          }, { threshold: 0 }).observe(hero);
        } else {
          inView = true; last = performance.now(); raf = requestAnimationFrame(animate);
        }

        // Re-seed on theme change so opacity matches the surface.
        new MutationObserver(function () {
          maxOp = document.documentElement.getAttribute("data-theme") === "dark" ? 0.26 : 0.17;
          setup();
        }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      }

      heroes.forEach(build);
    })();
  });
})();
