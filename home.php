<?php get_header(); ?>

    <div class="container-fluid">
      <div class="portfolio-site-wrapper container-sm position-relative my-4">
        <?php 
            if ( have_posts() ) {
                while( have_posts() ) {
                    esc_html(the_post());
                    ?>
                    <h3 class="portfolio-site-title position-absolute start-10 top-40">
                      <a class="position-relative text-decoration-none" href="<?php esc_url(the_permalink())?>"><?php esc_html_e(get_the_title())?></a>
                    </h3>
                    <div class="portfolio-site-image-wrapper">
                      <?php
                      esc_html(the_post_thumbnail('medium', ['class' => substr(get_the_post_thumbnail(), 123, 45) . ' rounded-1 position-relative']));
                      ?>
                      <a href="<?php esc_url(the_permalink())?>">
                        <div class="portfolio-image-overlay"></div>
                      </a>
                    </div>
                    <?php
                }
             }
          ?>
      </div>
    </div>

<?php get_footer(); ?>