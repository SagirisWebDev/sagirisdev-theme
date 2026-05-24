// Tab group switcher (Flowbite-compatible markup)
// Markup contract:
//   <ul data-tabs-toggle="<panels-container-selector>"
//       data-tabs-active-classes="<space-separated classes>"
//       data-tabs-inactive-classes="<space-separated classes>">
//     <li><button data-tabs-target="<panel-selector>" aria-selected="…">Label</button></li>
//   </ul>
//   <div id="<panel-id>" class="hidden">…</div>
// Each [data-tabs-toggle] becomes its own independent tab group. The first
// button in each group is activated on initial render.
(function () {
  document.querySelectorAll('[data-tabs-toggle]').forEach(function (tabList) {
    var activeClasses = (tabList.getAttribute('data-tabs-active-classes') || '').split(' ').filter(Boolean);
    var inactiveClasses = (tabList.getAttribute('data-tabs-inactive-classes') || '').split(' ').filter(Boolean);
    var buttons = Array.from(tabList.querySelectorAll('[data-tabs-target]'));
    if (buttons.length === 0) return;

    function activate(activeBtn) {
      buttons.forEach(function (b) {
        var panel = document.querySelector(b.getAttribute('data-tabs-target'));
        var isActive = b === activeBtn;
        b.setAttribute('aria-selected', String(isActive));
        activeClasses.forEach(function (c) { b.classList.toggle(c, isActive); });
        inactiveClasses.forEach(function (c) { b.classList.toggle(c, !isActive); });
        if (panel) panel.classList.toggle('hidden', !isActive);
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { activate(b); });
    });

    activate(buttons[0]);
  });
})();
