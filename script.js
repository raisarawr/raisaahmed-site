(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var gallery = document.getElementById("portrait-gallery");
  if (!gallery) return;

  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover =
    window.matchMedia && window.matchMedia("(hover: hover)").matches;

  if (prefersReduced || canHover) return;

  var portraits = gallery.querySelectorAll(".portrait");

  gallery.addEventListener("click", function (e) {
    var portrait = e.target.closest(".portrait");
    if (!portrait || !gallery.contains(portrait)) return;

    var isActive = portrait.classList.contains("is-active");
    portraits.forEach(function (el) {
      el.classList.remove("is-active");
    });
    if (!isActive) {
      portrait.classList.add("is-active");
    }
  });

  document.addEventListener("click", function (e) {
    if (!gallery.contains(e.target)) {
      portraits.forEach(function (el) {
        el.classList.remove("is-active");
      });
    }
  });
})();
