</main>
  <footer class="footer w-full md:w-[100vw] md:left-[1vw] cap:max-w-[1535px] cap:mx-auto cap:left-0 cap:right-0 p-3 border-t-2 rounded-xs border-t-neutral-100 absolute">
    <div class="container-fluid flex flex-col md:flex-row md:items-center md:justify-between gap-2" id="footer-container">
      <p class="footer-text fs-3 text-white">&copy; Sagiris Web Development <?php esc_html_e(date("Y")) ?></p>
      <?php $privacy_url = function_exists('get_privacy_policy_url') ? get_privacy_policy_url() : ''; ?>
      <?php if ($privacy_url) : ?>
        <nav class="footer-nav" aria-label="<?php esc_attr_e('Footer', 'sagirisdev'); ?>">
          <ul class="flex gap-4 list-none p-0 m-0">
            <li><a class="footer-text fs-3 text-white hover:text-neutral-300" href="<?php echo esc_url($privacy_url); ?>"><?php esc_html_e('Privacy Policy', 'sagirisdev'); ?></a></li>
          </ul>
        </nav>
      <?php endif; ?>
    </div>
  </footer>
  <?php
    wp_footer();
  ?>
  </body>
</html>