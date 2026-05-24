<?php get_header(); ?>
<main class="relative max-w-[1350px] w-[80%] mx-auto mt-8">
  <div class="container-fluid">
    <h1 class="font-bank-gothic text-4xl rounded-1 text-gray-300 max-w-96 border-b-3 border-gray-100 pb-3 ps-3 mx-6 mb-12">
      404
    </h1>
    <div class="px-6">
      <p class="text-gray-300 text-xl mb-6">The page you're looking for doesn't exist.</p>
      <a href="<?php echo esc_url( get_home_url() ); ?>" class="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-neutral-900 rounded-lg border border-neutral-700 hover:bg-neutral-800 transition-colors duration-300">
        &larr; Back to Home
      </a>
    </div>
  </div>
</main>
<?php get_footer(); ?>
