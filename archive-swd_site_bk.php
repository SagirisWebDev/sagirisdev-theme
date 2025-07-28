<?php get_header(); ?>

    <div class="container-fluid">
      <div class="portfolio-site-wrapper container-sm position-relative my-4">
        <h2 class="container-fluid display-2 text-center my-4">Portfolio</h2>
        <div class="container">
        <?php 
          esc_html_e('The page-portfolio.php template');

          $args = array(
            'post_type' => 'swd_site',
            'posts_per_page' => -1,
          );
          $loop = new WP_Query($args);
          while ( $loop->have_posts() ):
            $loop->the_post();
            ?>
            <div class="entry-content">
              <?php the_content(); ?>
            </div>
            <?php
          endwhile;
        ?>
    </div>
        <?php 
            // if ( have_posts() ) {
            //     while( have_posts() ) {
            //         esc_html(the_post());
            //         ?>
            <!-- //         <h3 class="portfolio-site-title position-absolute start-10 top-40"> -->
            <!-- //           <a class="position-relative text-decoration-none" href="<?php //esc_url(the_permalink())?>"><?php //esc_html_e(get_the_title())?></a> -->
            <!-- //         </h3> -->
            <!-- //         <div class="portfolio-site-image-wrapper"> -->
            //           <?php
            //           esc_html(the_post_thumbnail('medium', ['class' => substr(get_the_post_thumbnail(), 123, 45) . ' rounded-1 position-relative']));
            //           ?>
            <!-- //           <a href="<?php //esc_url(the_permalink())?>"> -->
            <!-- //             <div class="portfolio-image-overlay"></div> -->
            <!-- //           </a> -->
            <!-- //         </div> -->
            //         <?php
            //     }
            //  }
          ?>
      </div>
    </div>

<?php get_footer(); ?>