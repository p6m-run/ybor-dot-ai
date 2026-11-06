/* ==========================================================================
   Pause animations (WCAG 2.2.2 Pause, Stop, Hide)
   Loaded in <head> on every page, before the animation scripts.
   - The visitor's choice is stored in localStorage "ybor-motion" and shown as
     data-motion="paused" on <html>. site.css settles CSS animations while paused.
   - Animation scripts schedule each step with yborMotion.later() instead of
     setTimeout(). While paused, steps that come due wait in a queue and run
     when the visitor resumes, so every loop stops where it is.
   ========================================================================== */
(function () {
  var root = document.documentElement, KEY = "ybor-motion", queue = [];
  try { if (localStorage.getItem(KEY) === "paused") root.setAttribute("data-motion", "paused"); } catch (e) {}

  var M = {
    paused: function () { return root.getAttribute("data-motion") === "paused"; },
    later: function (fn, ms) {
      var id = setTimeout(function () {
        if (M.paused()) queue.push({ id: id, fn: fn }); else fn();
      }, ms);
      return id;
    },
    clear: function (id) {
      clearTimeout(id);
      for (var i = queue.length - 1; i >= 0; i--) if (queue[i].id === id) queue.splice(i, 1);
    },
    set: function (paused) {
      if (paused) root.setAttribute("data-motion", "paused"); else root.removeAttribute("data-motion");
      try { if (paused) localStorage.setItem(KEY, "paused"); else localStorage.removeItem(KEY); } catch (e) {}
      if (!paused) queue.splice(0).forEach(function (q) { q.fn(); });
      try { window.dispatchEvent(new CustomEvent("ybor:motion", { detail: { paused: paused } })); } catch (e) {}
    }
  };
  window.yborMotion = M;
})();
