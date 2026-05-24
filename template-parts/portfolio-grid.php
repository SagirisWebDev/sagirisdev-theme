<?php
/**
 * Portfolio grid panel — one tab panel containing a query loop of portfolio items.
 *
 * Args (via $args from get_template_part):
 *   post_type     (string)  Custom post type to query. Required.
 *   panel_id      (string)  HTML id for the tab panel container. Required.
 *   aria_label    (string)  Value for aria-labelledby on the tab panel. Required.
 *   hidden        (bool)    If true, panel renders with the 'hidden' class. Default false.
 *   posts_per_page (int)    Max items to query. Default 6.
 */

$post_type      = isset($args['post_type']) ? $args['post_type'] : '';
$panel_id       = isset($args['panel_id']) ? $args['panel_id'] : '';
$aria_label     = isset($args['aria_label']) ? $args['aria_label'] : '';
$hidden         = !empty($args['hidden']);
$posts_per_page = isset($args['posts_per_page']) ? (int) $args['posts_per_page'] : 6;

if (!$post_type || !$panel_id || !$aria_label) {
  return;
}

$query = new WP_Query([
  'post_type'      => $post_type,
  'posts_per_page' => $posts_per_page,
]);
?>
<div class="<?php echo $hidden ? 'hidden' : ''; ?>" id="<?php echo esc_attr($panel_id); ?>" role="tabpanel" aria-labelledby="<?php echo esc_attr($aria_label); ?>">
  <div class="wp-row flex flex-wrap justify-center items-center gap-0.5">
    <div class="wp-query-loop">
      <ul class="wp-post-template flex flex-row flex-wrap justify-start gap-8">
        <?php
        if ($query->have_posts()) {
          while ($query->have_posts()) {
            $query->the_post();
            $thumb_id  = get_post_thumbnail_id();
            $thumb_alt = $thumb_id ? get_post_meta($thumb_id, '_wp_attachment_image_alt', true) : '';
            $li_classes = get_post_class('wp-post md:max-w-[450px] md:p-4');
            ?>
            <li class="<?php echo esc_attr(implode(' ', $li_classes)); ?>">
              <a href="<?php the_permalink(); ?>">
                <figure class="post-featured-img">
                  <img class="attachment-post-thumbnail size-post-thumbnail wp-post-image"
                       src="<?php echo esc_url(get_the_post_thumbnail_url(get_the_ID())); ?>"
                       alt="<?php echo esc_attr($thumb_alt); ?>"
                       style="object-fit: cover;" />
                </figure>
                <h2 class="post-title font-bank-gothic font-semibold text-xl text-center">
                  <?php the_title(); ?>
                </h2>
              </a>
            </li>
            <?php
          }
        }
        wp_reset_postdata();
        ?>
      </ul>
    </div>
  </div>
</div>
