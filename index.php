<?php get_header(); ?>

    <div class="container portfolio">
        <?php 
            if ( have_posts() ) {
                while( have_posts() ) {
                    the_post();
                    the_title();
                    the_content();

                    get_template_part('template-parts/content', 'archive');
                }

                esc_html_e('The index.php template');
            }
        ?>
    </div>

<?php get_footer(); ?>