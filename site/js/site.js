/* ==========================================================================
   Ybor.ai Marketing Site - shared interactions
   ========================================================================== */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    /* ---- Logo swap: real white asset in dark mode (no CSS filter) ---- */
    (function () {
      function swap() {
        var dark = document.documentElement.getAttribute("data-theme") === "dark";
        document.querySelectorAll(".logo img, .footer-mark img").forEach(function (i) {
          var s = i.getAttribute("src") || "";
          var n = dark ? s.replace("_blk", "_wte") : s.replace("_wte", "_blk");
          if (n !== s) i.setAttribute("src", n);
          i.style.filter = "none";
        });
      }
      swap();
      new MutationObserver(swap).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    })();

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
        /* Pause / play animations (WCAG 2.2.2), only where the page has motion
           and the visitor hasn't asked their system for reduced motion. */
        var M = window.yborMotion;
        var hasMotion = document.querySelector("section.hero, .sf[data-sf], [data-dx], [data-modes], [data-trace], .run-row, .hom-anim, .logobar-track");
        var reducedSys = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (M && hasMotion && !reducedSys) {
          var mb = document.createElement("button");
          mb.type = "button";
          mb.className = "motion-toggle";
          mb.innerHTML = '<i data-lucide="pause" class="mi-pause"></i><i data-lucide="play" class="mi-play"></i>';
          var syncMotion = function () {
            var p = M.paused();
            mb.setAttribute("aria-pressed", p ? "true" : "false");
            mb.setAttribute("aria-label", "Pause animations");
            mb.title = p ? "Play animations" : "Pause animations";
          };
          mb.addEventListener("click", function () { M.set(!M.paused()); syncMotion(); });
          /* Floats in the bottom-right corner, but sits right after the skip
             link in the page so keyboard users reach it on the second Tab. */
          var skip = document.querySelector(".skip-link");
          if (skip) skip.insertAdjacentElement("afterend", mb);
          else document.body.insertBefore(mb, document.body.firstChild);
          syncMotion();
        }
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

    /* ---- Solid CTA expanding-icon interaction ----
       The button's own icon (arrow, download...) moves into the square on the
       right; buttons without one get an arrow. Runs before Lucide draws icons. */
    (function () {
      var ARROW = '<i data-lucide="arrow-right" class="ic"></i>';
      document.querySelectorAll(".btn-primary, .btn-dark, .btn-onpurple").forEach(function (btn) {
        if (btn.dataset.fx) return;
        if (!(btn.textContent || "").trim()) return; // skip icon-only buttons
        btn.dataset.fx = "1";
        btn.classList.add("btn-fx");
        var icon = btn.querySelector("i[data-lucide], svg");
        var span = document.createElement("span");
        span.className = "btn-fx-label";
        Array.prototype.slice.call(btn.childNodes).forEach(function (n) {
          if (n !== icon) span.appendChild(n);
        });
        span.normalize();
        if (span.lastChild && span.lastChild.nodeType === 3) span.lastChild.nodeValue = span.lastChild.nodeValue.replace(/\s+$/, "");
        if (span.firstChild && span.firstChild.nodeType === 3) span.firstChild.nodeValue = span.firstChild.nodeValue.replace(/^\s+/, "");
        var chev = document.createElement("span");
        chev.className = "btn-fx-chev";
        chev.setAttribute("aria-hidden", "true");
        if (icon) chev.appendChild(icon); else chev.innerHTML = ARROW;
        btn.appendChild(span);
        btn.appendChild(chev);
      });
    })();

    /* ---- Lucide icons ---- */
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }

    /* ---- Desktop nav dropdowns (click + hover via CSS) ---- */
    /* Disclosure pattern: each nav button reports aria-expanded; Escape closes. */
    var navItems = document.querySelectorAll(".nav-item.has-dd");
    function setNav(item, open) {
      item.classList.toggle("open", open);
      var b = item.querySelector(".nav-link");
      if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    }
    function closeAllNav() { navItems.forEach(function (i) { setNav(i, false); }); }
    navItems.forEach(function (item) {
      var btn = item.querySelector(".nav-link");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var wasOpen = item.classList.contains("open");
        closeAllNav();
        if (!wasOpen) setNav(item, true);
      });
      /* close when keyboard focus leaves the item */
      item.addEventListener("focusout", function (e) {
        if (!item.contains(e.relatedTarget)) setNav(item, false);
      });
    });
    document.addEventListener("click", closeAllNav);

    /* ---- Mobile menu (modal dialog) ---- */
    var mm = document.getElementById("mobileMenu");
    var openBtn = document.getElementById("hamburger");
    var closeBtn = document.getElementById("mmClose");
    function focusables() {
      return mm ? [].slice.call(mm.querySelectorAll('a[href], button:not([disabled])')).filter(function (el) { return el.offsetParent !== null; }) : [];
    }
    function openMenu() {
      if (!mm) return;
      mm.classList.add("open");
      mm.setAttribute("aria-hidden", "false");
      if (openBtn) openBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      setTimeout(function () { if (closeBtn) closeBtn.focus(); }, 50);
    }
    function closeMenu() {
      if (!mm || !mm.classList.contains("open")) return;
      mm.classList.remove("open");
      mm.setAttribute("aria-hidden", "true");
      if (openBtn) { openBtn.setAttribute("aria-expanded", "false"); openBtn.focus(); }
      document.body.style.overflow = "";
    }
    if (openBtn) openBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (mm) mm.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (mm && mm.classList.contains("open")) { closeMenu(); return; }
      var open = document.querySelector(".nav-item.has-dd.open");
      if (open) { setNav(open, false); var b = open.querySelector(".nav-link"); if (b) b.focus(); }
    });
    /* close the menu if the window grows past the mobile breakpoint */
    window.addEventListener("resize", function () { if (window.innerWidth > 1020) closeMenu(); });

    /* ---- Mobile accordions ---- */
    document.querySelectorAll("button.mm-acc-head").forEach(function (h) {
      h.setAttribute("aria-expanded", h.parentElement.classList.contains("open") ? "true" : "false");
      h.addEventListener("click", function () {
        var open = h.parentElement.classList.toggle("open");
        h.setAttribute("aria-expanded", open ? "true" : "false");
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
        /* ---- Delivery to salesinquiries@ybor.ai ----
           Submissions are POSTed as JSON to the form's data-endpoint
           (/api/contact, see api/contact.js). The server picks the recipient;
           nothing here chooses where mail goes. If the request fails (or there's
           no endpoint, as in a local preview), the visitor's email app opens
           with a prefilled message instead. No keys or secrets live in this file. */
        var TO = form.getAttribute("data-to") || "salesinquiries@ybor.ai";
        var endpoint = form.getAttribute("data-endpoint") || window.YBOR_FORM_ENDPOINT || "";
        var val = function (n) { var f = form.querySelector('[name="' + n + '"]'); return f ? f.value.trim() : ""; };
        var data = {
          intent: val("intent"),
          firstName: val("firstName"),
          lastName: val("lastName"),
          email: val("email"),
          company: val("company"),
          role: val("role"),
          size: val("size"),
          message: val("message"),
          consent: !!(form.querySelector('[name="consent"]') || {}).checked,
          website: val("website"), /* honeypot: real visitors leave it empty */
          page: window.location.href,
          submittedAt: new Date().toISOString()
        };
        var subject = "[Website] " + (data.intent || "Inquiry") + " | " + data.company;
        var body = [
          "Inquiry type: " + data.intent,
          "Name: " + data.firstName + " " + data.lastName,
          "Email: " + data.email,
          "Company: " + data.company,
          "Role: " + data.role,
          "Company size: " + data.size,
          "",
          "Message:",
          data.message || "(none)",
          "",
          "Sent from " + data.page
        ].join("\n");

        var showSuccess = function (viaEmailApp) {
          form.style.display = "none";
          var success = document.getElementById("formSuccess");
          if (!success) return;
          var note = success.querySelector("[data-mailto-note]");
          if (note) note.style.display = viaEmailApp ? "" : "none";
          success.classList.add("show");
        };
        var openMail = function () {
          window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
          showSuccess(true);
        };

        if (!endpoint) { openMail(); return; }

        var btn = form.querySelector('[type="submit"]');
        if (btn) { btn.disabled = true; btn.setAttribute("aria-busy", "true"); }
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(data)
        }).then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          showSuccess(false);
        }).catch(function () {
          if (btn) { btn.disabled = false; btn.removeAttribute("aria-busy"); }
          openMail(); /* endpoint failed: fall back so the lead isn't lost */
        });
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
          nf.innerHTML = '<span class="mono" style="font-size:13px;color:var(--green-dark)">// subscribed · check your inbox</span>';
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
        "architecture-demo": "Book a demo", "pricing": "Pricing", "soc2": "Security review",
        "security-review": "Security review", "careers": "Careers", "partner": "Partner", "press": "Press"
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
          if (!inView || (window.yborMotion && window.yborMotion.paused())) { raf = 0; return; }
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

        window.addEventListener("ybor:motion", function () {
          if (inView && !raf && !window.yborMotion.paused()) { last = performance.now(); raf = requestAnimationFrame(animate); }
        });

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
