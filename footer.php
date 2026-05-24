</main>
  <footer class="footer w-full md:w-[100vw] md:left-[1vw] p-3 border-t-2 rounded-xs border-t-neutral-100 absolute">
    <div class="container-fluid" id="footer-container">
      <p class="footer-text fs-3 text-white">&copy; Sagiris Web Development <?php esc_html_e(date("Y")) ?></p>
    </div>
  </footer>
  <script>
    (function() {
      var btn = document.querySelector('[data-collapse-toggle="navbar-default"]');
      var nav = document.getElementById('navbar-default');
      if (!btn || !nav) return;
      btn.addEventListener('click', function() {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        nav.classList.toggle('hidden');
      });
    })();

    (function() {
      var tabList = document.querySelector('[data-tabs-toggle]');
      if (!tabList) return;
      var activeClasses = (tabList.getAttribute('data-tabs-active-classes') || '').split(' ').filter(Boolean);
      var inactiveClasses = (tabList.getAttribute('data-tabs-inactive-classes') || '').split(' ').filter(Boolean);
      var buttons = Array.from(tabList.querySelectorAll('[data-tabs-target]'));

      function activate(activeBtn) {
        buttons.forEach(function(b) {
          var panel = document.querySelector(b.getAttribute('data-tabs-target'));
          var isActive = b === activeBtn;
          b.setAttribute('aria-selected', String(isActive));
          activeClasses.forEach(function(c) { b.classList.toggle(c, isActive); });
          inactiveClasses.forEach(function(c) { b.classList.toggle(c, !isActive); });
          if (panel) panel.classList.toggle('hidden', !isActive);
        });
      }

      buttons.forEach(function(b) {
        b.addEventListener('click', function() { activate(b); });
      });

      activate(buttons[0]);
    })();
  </script>
  <?php
    wp_footer();
  ?>
  </body>
</html>