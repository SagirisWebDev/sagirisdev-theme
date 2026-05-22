<?php get_header(); ?>

    <div class="container-fluid">
		<h1 class="font-bank-gothic text-4xl rounded-1 text-gray-300 max-w-96 border-b-3 border-gray-100 pb-3 ps-3 mx-6 mb-12">
			Blog
		</h1>
      <div class="portfolio-site-wrapper w-sm position-relative my-4 px-4">
        <?php
		  if ( have_posts() ) {
			  while( have_posts() ) {
				  esc_html(the_post());
		?>
		  <div class="portfolio-site-image-wrapper">
			  <?php
			esc_html(the_post_thumbnail('medium', ['class' => substr(get_the_post_thumbnail(), 123, 45) . ' rounded-1 position-relative']));
			  ?>
		  </div>
		  <h3 class="portfolio-site-title position-absolute start-10 top-40">
			  <a class="position-relative text-decoration-none" href="<?php esc_url(the_permalink())?>"><?php esc_html_e(get_the_title())?>
			  </a>
		  </h3>
		  <?php the_excerpt(55); ?>
		  <p class="inline-block my-4"><?php the_date(); ?></p>
		  <?php
                }
		  	}
          ?>
      </div>
    </div>

<?php get_footer(); ?>