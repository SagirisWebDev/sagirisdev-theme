<?php
/**
 * Sagiris Development Theme
 *
 *
 */

require_once get_template_directory() . '/inc/classes/class-wp-bootstrap-navwalker.php';

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
  $version = wp_get_theme()-> get('Version');

  // style.css
  wp_enqueue_style('sagirisdev-style', get_template_directory_uri() . '/style.css', array(), $version, 'all');

  // index.js
  wp_enqueue_script('sagirisdev-index', get_template_directory_uri(). '/assets/js/index.js', array(), '1.0', true);

  // flowbite css
  wp_enqueue_style('flowbite', 'https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css', array(), '3.1.2', 'all');

  // flowbite ui
  wp_enqueue_script('flowbite', 'https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.js', [], '3.1.2', true);
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