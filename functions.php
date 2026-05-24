<?php
//  Theme Features
function sagirisdev_theme_support(){

  $custom_logo_defaults = array(
    'height' => 106,
    'width' => 300,
    'unlink-homepage-logo' => true,
  );
  add_theme_support('title-tag');
  add_theme_support('custom-logo', $custom_logo_defaults);
  add_theme_support('post-thumbnails');
  add_theme_support('custom-background');
  add_theme_support('editor-styles');
  add_editor_style('editor-styles.css');
}
add_action('after_setup_theme', 'sagirisdev_theme_support');

/**
 * Add Styling to Nav Menu Links
 * 
 * @see https://developer.wordpress.org/reference/hooks/nav_menu_link_attributes/
 */
function add_styles_nav_menu( $atts, $item, $args ) {
	  $atts['class'] = esc_attr('font-medium text-gray-600 hover:text-gray-400 focus:outline-hidden focus:text-gray-400 dark:text-neutral-400 dark:hover:text-neutral-500 dark:focus:text-neutral-500');
    return $atts;
}

add_filter( 'nav_menu_link_attributes', 'add_styles_nav_menu', 10, 3 );

// Enqueue Styles and Scripts
function sagirisdev_register_styles_scripts() {
  $version = wp_get_theme()->get('Version');
  $theme_uri = get_template_directory_uri();

  wp_enqueue_style('sagirisdev-style', $theme_uri . '/style.css', array(), $version, 'all');

  // Small UI utilities (self-init, no dependencies). Enqueued in footer so
  // they run after the DOM exists, matching their former placement as inline
  // scripts at the end of footer.php.
  wp_enqueue_script('sagirisdev-nav-toggle', $theme_uri . '/assets/js/ui/nav-toggle.js', array(), $version, true);
  wp_enqueue_script('sagirisdev-tabs', $theme_uri . '/assets/js/ui/tabs.js', array(), $version, true);

  if (is_front_page()) {
    wp_enqueue_script('sagirisdev-fp-height-sync', $theme_uri . '/assets/js/ui/fp-height-sync.js', array(), $version, true);
  }

  /* WebGL emblem bundle preloaded on front page in header.php */
}

add_action('wp_enqueue_scripts', 'sagirisdev_register_styles_scripts');

/**
 * Disable Image Size Threshold for 4K Image Support
 * 
 * @see https://make.wordpress.org/core/2019/10/09/introducing-handling-of-big-images-in-wordpress-5-3/
 */
add_filter('big_image_size_threshold', '__return_false');

/**
 * Preserve JPEG Quality
 * 
 * @see https://developer.wordpress.org/reference/hooks/jpeg_quality/
 */
add_filter('jpeg_quality', function() { return 100; });