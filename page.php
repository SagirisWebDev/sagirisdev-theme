<?php get_header(); ?>

    <div class="container-sm mb-5">
        <?php 
            if ( have_posts() ) {
                while( have_posts() ) {
                    the_post();
                    esc_html(the_title('<h2 class="post-title container-fluid display-2 text-center mt-4">', '</h2>'));
                    the_content();
                }
            }
        ?>
    </div>

<?php get_footer(); ?>