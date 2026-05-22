<?php
	get_header();
	$prev_link = (get_post_type() === 'swd_site' || get_post_type() === 'swd_block' || get_post_type() === 'swd_plugin') ? 'portfolio' : 'blog-posts';
	$prev_link_text = $prev_link === 'portfolio' ? 'Return to Portfolio' : 'Return to Blog';
	
?>
<div class="wp-block-button group mx-2">
  <span></span>
  <a href="<?php echo site_url($prev_link); ?>" class="wp-block-button__link wp-element-button px-2"><?php esc_html_e($prev_link_text); ?></a>
</div>
    <div class="w-full post-container my-4 px-2">
        <h1><?php the_title(); ?></h1>
        <?php 
            if ( have_posts() ) {
                while( have_posts() ) {
                    the_post();                  
                    the_content();
                }
            }
        ?>
    </div>

<?php get_footer(); ?>