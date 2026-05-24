// Collapsible nav toggle
// Markup contract:
//   <button data-collapse-toggle="<target-id>" aria-expanded="false">…</button>
//   <div id="<target-id>" class="hidden">…</div>
// Multiple toggles on a page are supported.
(function () {
  document.querySelectorAll('[data-collapse-toggle]').forEach(function (btn) {
    var targetId = btn.getAttribute('data-collapse-toggle');
    var target = document.getElementById(targetId);
    if (!target) return;
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      target.classList.toggle('hidden');
    });
  });
})();
