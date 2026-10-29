/* Poster Studies: individual poster page behaviour.
   Print / save-as-PDF export and left-right navigation between the eight studies. */
(function () {
  "use strict";

  var order = [
    "midnight-grove", "sana-sana", "ritual", "the-outside",
    "afterhours", "capsule", "horizon-cinema", "market-day-social"
  ];

  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function () { window.print(); });
  });

  var slug = document.body.dataset.poster;
  if (order.indexOf(slug) === -1) return;

  document.addEventListener("keydown", function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target.closest("input,textarea,select")) return;
    var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    var next = order.indexOf(slug) + step;
    if (next < 0 || next >= order.length) return;
    window.location.href = "../" + order[next] + "/";
  });
})();
