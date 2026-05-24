<?php get_header(); ?>
<main class="relative max-w-[1350px] w-[80%] mx-auto mt-8">
<div class="graphics-wrapper absolute -z-1 left-[0%] top-[-10lvh] 2xl:left-[-10vw]">
  <div class="canvas-wrapper absolute top-[-5lvh] overflow-hidden">
    <canvas id="canvas" class="h-auto w-full aspect-square object-contain" style="opacity:0;transition:opacity 1.4s ease;"></canvas>
  </div>
  <div class="logo absolute w-screen md:w-[35vw] xl:w-[39vw] 2xl:w-[42vw] 3xl:w-[45vw] max-w-[620px] md:max-w-[330px] lg:max-w-[380px] xl:max-w-[430px] 2xl:max-w-[450px] 3xl:max-w-[475px] flex flex-col flex-nowrap top-[45svh] sm:left-[calc(5vw+2px)] nav:left-[calc(10vw+2px)] md:left-[calc(11vw+2px)] lg:left-[calc(12vw+2px)] xl:left-[calc(12vw+10px)] xl2xl:left-[calc(14vw+2px)] 2xl:left-[calc(14vw+10px)] 3xl:left-[calc(16vw+10px)] p-8">
    <img class="mt-4 w-full" width="429" height="56" src="<?php echo get_template_directory_uri(); ?>/assets/img/Sagiris.svg" alt="sagiris" fetchpriority="high">
    <img class="w-3/4 mx-auto mt-2" width="171" height="23" src="<?php echo get_template_directory_uri(); ?>/assets/img/Web-Development-v2.svg" alt="web development">
  </div>
</div>
<div class="fp-content md:max-w-md xl:max-w-lg absolute flex flex-col flex-nowrap top-[70svh] md:top-[-5svh] md:right-0 p-[1rem] mt-8">
  <h1 class="font-bank-gothic text-4xl rounded-1 text-gray-300 max-w-96 border-b-3 border-gray-100 pb-3 ps-3 mx-6 mb-12">Latest News</h1>
  <div>
  <?php
  // Get all public post types
  $post_types = get_post_types(['public' => true], 'names');

  $args = [
    'post_type' => $post_types,
    'post_status' => 'publish',
    'posts_per_page' => 3,
    'orderby' => 'date',
    'order' => 'DESC',
  ];

  $query = new WP_Query($args);

  if ($query->have_posts()):
    while ($query->have_posts()):
      $query->the_post();
      $class_names = implode( ' ', get_post_class() )
      ?>
      <div class="<?php echo esc_attr($class_names); ?> max-w-lg bg-gray-400/50 border border-gray-500 rounded-lg shadow-sm my-3">
        <div class="p-5">
          <a href="<?php the_permalink(); ?>">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"><?php the_title(); ?></h5>
          </a>
          <p class="mb-3 font-normal text-white"><?php echo get_the_excerpt(); ?></p>
          <a href="<?php the_permalink(); ?>"
            class="inline-flex items-center px-3 py-2 mt-3 text-sm font-medium text-center text-white bg-neutral-900 rounded-lg hover:text-black hover:bg-neutral-800 focus:ring-4 focus:outline-none focus:ring-blue-800 dark:bg-neutral-900 dark:hover:bg-neutral-300 dark:focus:ring-neutral-800">
            See more
            <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 14 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </a>
        </div>
      </div>

    <?php endwhile;
    wp_reset_postdata();
  else:
    echo '<p>No content found.</p>';
  endif;
  ?>
  </div>
</div>

<script>
(function() {
  var fp = document.querySelector('.fp-content');
  var main = document.querySelector('main');
  if (!fp || !main) return;
  function sync() {
    main.style.minHeight = (fp.getBoundingClientRect().bottom - main.getBoundingClientRect().top) + 'px';
  }
  document.addEventListener('DOMContentLoaded', sync);
  new ResizeObserver(sync).observe(document.body);
})();
</script>
<?php get_footer(); ?>