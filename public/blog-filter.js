// Blog category filter. Kept as a standalone self-hosted file (not inlined)
// so the site's Content-Security-Policy can stay strict: script-src 'self'.
(function () {
  var buttons = document.querySelectorAll('.filter-btn');
  var cards = document.querySelectorAll('#post-grid [data-category]');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.dataset.filter;

      // Highlight the active button
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === button));
      });

      // Show matching cards, hide the rest
      cards.forEach(function (card) {
        var show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();
