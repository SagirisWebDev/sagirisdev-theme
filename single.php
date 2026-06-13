<?php
	get_header();
	$is_portfolio = (get_post_type() === 'swd_site' || get_post_type() === 'swd_block' || get_post_type() === 'swd_plugin');
	$prev_link = $is_portfolio ? 'portfolio' : 'blog-posts';
	$prev_link_text = $is_portfolio ? 'Return to Portfolio' : 'Return to Blog';

?>
<main class="relative max-w-[1350px] w-[80%] mx-auto mt-8">
<div class="wp-block-button group mx-2">
  <span></span>
  <a href="<?php echo site_url($prev_link); ?>" class="wp-block-button__link wp-element-button px-2"><?php esc_html_e($prev_link_text); ?></a>
</div>

<?php if ( ! $is_portfolio ) : ?>
<div class="post-layout">
<?php endif; ?>

    <div class="<?php echo $is_portfolio ? 'w-full' : 'post-container'; ?> my-4 px-2">
        <?php
            if ( have_posts() ) {
                while( have_posts() ) {
                    the_post();
                    ?>
                    <h1><?php the_title(); ?></h1>
                    <?php if ( ! $is_portfolio ) : ?>
                    <div class="post-meta">
                        <time datetime="<?php echo get_the_date('Y-m-d'); ?>"><?php echo get_the_date('F j, Y'); ?></time>
                        <?php
                        $word_count = str_word_count(strip_tags(get_the_content()));
                        $reading_time = max(1, ceil($word_count / 200));
                        ?>
                        <span><?php echo $reading_time; ?> min read</span>
                    </div>
                    <?php endif; ?>
                    <?php
                    the_content();
                }
            }
        ?>
    </div>

<?php if ( ! $is_portfolio ) : ?>
    <aside class="toc-sidebar" aria-label="Table of contents">
        <p class="toc-title">On this page</p>
        <nav id="toc-nav"></nav>
    </aside>
</div><!-- /.post-layout -->
<?php endif; ?>

<?php get_footer(); ?>
