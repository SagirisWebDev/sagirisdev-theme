<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>
<body <?php body_class();?>>
  <?php
    if ( function_exists( 'wp_body_open' ) ) {
      wp_body_open();
    }
  ?>
<header class="relative flex flex-wrap sm:justify-start sm:flex-nowrap w-full bg-transparent text-sm py-3">
  <nav class="w-full">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <a href="https://flowbite.com/" class="flex items-center space-x-3 rtl:space-x-reverse">
          <img src="https://flowbite.com/docs/images/logo.svg" class="h-8" alt="Flowbite Logo" />
          <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
      </a>
      <button data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
          <span class="sr-only">Open main menu</span>
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
      </button>
      <div class="hidden w-screen md:w-[36.95rem] md:block md:flex md:flex-row md:justify-end md:border-b-2 md:rounded-xs md:border-b-neutral-100" id="navbar-default">
        <ul class="font-blinker-semibold flex flex-col py-0 px-6 pb-5 text-lg tracking-wider md:p-0 md:me-2 border-b-1 border-b-gray-100 rounded-xs md:flex-row space-y-4 md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:w-auto">
          <li>
            <a href="<?php echo esc_url(get_site_url() . '/archive'); ?>" class="block md:pt-0 md:pb-0 py-4 px-3 text-gray-300 text-center bg-transparent rounded-xs border-transparent md:rounded-sm border-2 hover:border-neutral-200
            hover:bg-gray-400/10 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200
            transition-colors duration-400 ">Blog</a>
          </li>
          <li>
            <a href="<?php echo esc_url(get_site_url() . '/portfolio'); ?>" class="block md:pt-0 md:pb-0 py-4 px-3 text-gray-300 text-center bg-transparent rounded-xs border-transparent md:rounded-sm border-2 hover:border-neutral-200
            hover:bg-gray-400/10 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200
            transition-colors duration-400 ">Portfolio</a>
          </li>
          <li>
            <a href="<?php echo esc_url(get_site_url() . '/about'); ?>" class="block md:pt-0 md:pb-0 py-4 px-3 text-gray-300 text-center bg-transparent rounded-xs border-transparent md:rounded-sm border-2 hover:border-neutral-200
            hover:bg-gray-400/10 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200
            transition-colors duration-400 ">About</a>
          </li>
          <li>
            <a href="<?php echo esc_url(get_site_url() . '/contact'); ?>" class="block md:pt-0 md:pb-0 py-4 px-3 text-white text-center bg-old-gold/75 rounded-xs md:rounded-sm border-2 border-transparent hover:border-neutral-200
            hover:bg-gray-400/10 focus:outline-2 focus:outline-offset-2 focus:outline-neutral-200
            transition-colors duration-400 ">Contact</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</header>  