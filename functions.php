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

  if (is_singular('post')) {
    wp_enqueue_script('sagirisdev-toc', $theme_uri . '/assets/js/ui/toc.js', array(), $version, true);
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

/**
 * Shopify password proxy for the Common Roast demo store.
 *
 * Intercepts /common-roast-access and serves a self-submitting form that
 * POSTs the storefront password directly to Shopify in the user's browser,
 * bypassing the manual password screen.
 */
function sagirisdev_common_roast_proxy() {
    if ( ! isset( $_SERVER['REQUEST_URI'] ) ) {
        return;
    }
    $path = rtrim( parse_url( $_SERVER['REQUEST_URI'], PHP_URL_PATH ), '/' );
    if ( $path !== '/common-roast-access' ) {
        return;
    }

    nocache_headers();
    status_header( 200 );

    $shopify_password_url = 'https://common-roast.myshopify.com/password';
    $store_password       = 'my store';
    $logo_url             = get_template_directory_uri() . '/assets/img/emblemv2-white.png';
    $bg_url               = get_template_directory_uri() . '/assets/img/black-sand-1.webp';

    ?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to Common Roast&hellip;</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100svh;
      background: #000 url('<?php echo esc_url( $bg_url ); ?>') center top / cover fixed;
      color: #f3f4f6;
      font-family: ui-sans-serif, system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
    }
    img { width: 48px; height: auto; opacity: 0.75; }
    p   { font-size: 1.05rem; opacity: 0.55; letter-spacing: 0.08em; }
    noscript a { color: oklch(0.8061 0.1596 103); text-underline-offset: 3px; }
  </style>
</head>
<body>
  <img src="<?php echo esc_url( $logo_url ); ?>" alt="Sagiris Web Dev">
  <p id="msg">Redirecting</p>

  <form id="cr-auth" method="post" action="<?php echo esc_url( $shopify_password_url ); ?>" hidden>
    <input type="hidden" name="form_type" value="storefront_password">
    <input type="hidden" name="utf8"      value="✓">
    <input type="hidden" name="password"  value="<?php echo esc_attr( $store_password ); ?>">
  </form>

  <noscript>
    <p>JavaScript is required. <a href="<?php echo esc_url( $shopify_password_url ); ?>">Open the store</a> and enter the password manually.</p>
  </noscript>

  <script>
    // Animate the ellipsis while the form submits
    var dots = 0;
    var el = document.getElementById('msg');
    setInterval(function() { dots = (dots + 1) % 4; el.textContent = 'Redirecting' + '.'.repeat(dots); }, 350);
    document.getElementById('cr-auth').submit();
  </script>
</body>
</html>
<?php
    exit();
}
add_action( 'template_redirect', 'sagirisdev_common_roast_proxy', 1 );