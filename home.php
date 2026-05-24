<?php get_header(); ?>
  <main class="relative max-w-[1350px] w-[80%] mx-auto mt-8">
    <div class="container-fluid">
		<h1 class="font-bank-gothic text-4xl rounded-1 text-gray-300 max-w-96 border-b-3 border-gray-100 pb-3 ps-3 mx-6 mb-12">
			Blog
		</h1>
      <div class="portfolio-site-wrapper flex flex-col md:flex-row flex-wrap gap-6 my-4 px-4">
        <?php
		  if ( have_posts() ) {
			  while( have_posts() ) {
				  the_post();
		?>
		  <div class="portfolio-site-card max-md:w-full md:w-[calc(50%-12px)] flex flex-col">
			  <div class="portfolio-site-image-wrapper">
				  <?php the_post_thumbnail('medium', ['class' => 'w-full rounded-1']); ?>
			  </div>
			  <h3 class="portfolio-site-title mt-3">
				  <a class="text-gray-300 hover:text-gray-100 no-underline" href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
			  </h3>
			  <?php the_excerpt(); ?>
			  <p class="inline-block my-4"><?php the_date(); ?></p>
		  </div>
		  <?php
                }
		  	}
          ?>
      </div>
    </div>

<?php get_footer(); ?>