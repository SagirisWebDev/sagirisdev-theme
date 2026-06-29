<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#000000">
  <?php
    wp_head();

    // Preload animation assets on front page
    if (is_front_page()):
      $theme_uri = get_template_directory_uri();
  ?>
  <link rel="preload" as="image" href="<?php echo $theme_uri; ?>/assets/img/Sagiris.svg" type="image/svg+xml" fetchpriority="high">
  <link rel="preload" as="image" href="<?php echo $theme_uri; ?>/assets/img/Web-Development-v2.svg" type="image/svg+xml">
  <script src="<?php echo $theme_uri; ?>/assets/js/dist/emblem.bundle.js" defer></script>
  <?php endif; ?>
</head>
<body <?php body_class(['relative w-screen max-w-[1535px] mx-auto! overflow-x-clip']);?>>
  <?php
    if ( function_exists( 'wp_body_open' ) ) {
      wp_body_open();
    }
    ?>
  <header class="site-header fixed inset-x-0 z-50 w-full md:w-[98vw] md:px-3 mx-auto cap:max-w-[1535px] cap:mx-auto top-0 flex flex-wrap sm:justify-start sm:flex-nowrap text-sm pt-3">
    <nav class="w-full flex flex-wrap items-center <?php echo esc_attr(!is_front_page() ?  "justify-between" : "justify-end"); ?>">
      <?php
      if (!is_front_page()) { 
        // Logo for front page
      ?>
      <a href="<?php echo esc_url(get_home_url()); ?>" class="inline-block px-5 w-fit space-x-3 rtl:space-x-reverse">
          <img src="<?php echo get_template_directory_uri() . "/assets/img/emblemv2-white.png"; ?>" class="h-8" alt="Sagiris Web Dev Logo" />
      </a>
      <?php } ?>
      <button data-collapse-toggle="navbar-default" type="button" class="items-center flex-1 p-2 h-10 text-sm text-gray-500 rounded-lg nav:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
        <span class="sr-only">Open main menu</span>
        <svg class="w-full h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
        </svg>
      </button>
      <div class="hidden w-screen nav:w-[36.95rem] nav:flex nav:flex-row nav:justify-end nav:border-b-2 nav:rounded-xs nav:border-b-neutral-100 md:py-4" id="navbar-default">
        <ul class="font-blinker-semibold flex max-nav:flex-col py-5 px-6 text-lg tracking-widest nav:p-0 nav:me-2 border-b-1 border-b-gray-100 rounded-xs nav:flex-row space-y-4 nav:space-x-8 rtl:space-x-reverse nav:mt-0 nav:border-0 nav:w-auto">
          <li class="nav:mb-0">
            <a href="<?php echo get_post_type_archive_link('post'); ?>" class="block nav:pt-0 nav:pb-0 py-4 px-3 text-black nav:text-gray-300 text-center bg-gray-300 nav:bg-transparent rounded-xs border-transparent nav:rounded-sm border-2 hover:border-neutral-200 hover:bg-gray-400/10 hover:text-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200 transition-colors duration-400">Blog</a>
          </li>
          <li class="nav:mb-0">
            <a href="<?php echo esc_url(get_site_url() . '/portfolio'); ?>" class="block nav:pt-0 nav:pb-0 py-4 px-3 text-black nav:text-gray-300 text-center bg-gray-300 nav:bg-transparent hover:text-gray-300 rounded-xs border-transparent nav:rounded-sm border-2 hover:border-neutral-200 hover:bg-gray-400/10 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200 transition-colors duration-400">Portfolio</a>
          </li>
          <li class="nav:mb-0">
            <a href="<?php echo esc_url(get_site_url() . '/about'); ?>" class="block nav:pt-0 nav:pb-0 py-4 px-3 text-black nav:text-gray-300 text-center bg-gray-300 nav:bg-transparent rounded-xs border-transparent nav:rounded-sm border-2 hover:border-neutral-200 hover:bg-gray-400/10 hover:text-gray-300 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200 transition-colors duration-400">About</a>
          </li>
          <li class="nav:mb-0">
            <a href="<?php echo esc_url(get_site_url() . '/contact'); ?>" class="block nav:pt-0 nav:pb-0 py-4 px-3 text-white text-center bg-old-gold/75 rounded-xs nav:rounded-sm border-2 border-transparent hover:border-neutral-200 hover:bg-gray-400/10 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200 transition-colors duration-400">Contact</a>
          </li>
        </ul>
      </div>
    </nav>
  </header>