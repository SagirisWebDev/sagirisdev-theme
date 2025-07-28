<?php get_header(); ?>

    <div class="container post-container my-4">
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