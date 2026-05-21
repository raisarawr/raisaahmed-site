(function () {
  "use strict";

  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var stack = document.getElementById("portrait-stack");
  if (!stack) return;

  var layers = stack.querySelectorAll(".portrait__inner");
  var prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  stack.querySelectorAll(".portrait").forEach(function (el) {
    el.classList.add("is-visible");
  });

  if (prefersReduced) return;

  var pointer = { x: 0, y: 0 };
  var target = { x: 0, y: 0 };
  var rafId = null;
  var maxTilt = 14;

  function onPointerMove(e) {
    var rect = stack.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    pointer.x = (e.clientX - cx) / (rect.width / 2);
    pointer.y = (e.clientY - cy) / (rect.height / 2);
    pointer.x = Math.max(-1, Math.min(1, pointer.x));
    pointer.y = Math.max(-1, Math.min(1, pointer.y));
    scheduleTick();
  }

  function onScroll() {
    scheduleTick();
  }

  function scheduleTick() {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(tick);
  }

  function tick() {
    rafId = null;
    target.x += (pointer.x - target.x) * 0.08;
    target.y += (pointer.y - target.y) * 0.08;

    var scrollY = window.scrollY || window.pageYOffset;
    var scrollFactor = Math.min(scrollY * 0.02, 12);

    layers.forEach(function (el) {
      var depth = parseFloat(el.getAttribute("data-depth") || "0.3");
      var tx = target.x * maxTilt * depth;
      var ty = target.y * maxTilt * depth - scrollFactor * depth;
      el.style.transform =
        "translate3d(" + tx + "px, " + ty + "px, 0)";
    });

    if (
      Math.abs(target.x - pointer.x) > 0.01 ||
      Math.abs(target.y - pointer.y) > 0.01
    ) {
      scheduleTick();
    }
  }

  stack.addEventListener("pointermove", onPointerMove, { passive: true });
  stack.addEventListener("pointerleave", function () {
    pointer.x = 0;
    pointer.y = 0;
    scheduleTick();
  });
  window.addEventListener("scroll", onScroll, { passive: true });
})();
