<?php get_header(); ?>
<main class="relative w-full max-w-[1350px] mx-auto mt-8">
<div class="container-sm mb-5">
  <h1 class="font-bank-gothic text-4xl rounded-1 text-gray-300 max-w-96 border-b-3 border-gray-100 pb-3 ps-3 mx-6 mb-8"><?php the_title(); ?></h1>
  <div class="flex flex-wrap justify-start w-full md:ms-5 p-5">
    <ul class="relative before:content[''] before:absolute before:bg-gray-100 before:min-w-xs before:w-3/7 before:h-[2px] before:-bottom-px before:left-0 xl:before:h-0 font-blinker flex flex-wrap justify-start items-center w-[100%] xl:w-fit xl:flex-col xl:flex-nowrap xl:justify-start gap-5 text-xl text-center mb-4 rounded-1" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" role="tablist" data-tabs-active-classes="text-purple-400 border-b-3 border-purple-400 hover:text-purple-200 hover:border-purple-200" data-tabs-inactive-classes="text-gray-300 hover:text-purple-200">
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 rounded-t-lg cursor-pointer" id="sites-styled-tab" data-tabs-target="#styled-sites" type="button" role="tab" aria-controls="sites" aria-selected="false">Sites</button>
      </li>
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 rounded-t-lg cursor-pointer" id="blocks-styled-tab" data-tabs-target="#styled-blocks" type="button" role="tab" aria-controls="blocks" aria-selected="false">Blocks</button>
      </li>
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 rounded-t-lg cursor-pointer" id="plugins-styled-tab" data-tabs-target="#styled-plugins" type="button" role="tab" aria-controls="plugins" aria-selected="false">Plugins</button>
      </li>
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 rounded-t-lg cursor-pointer" id="themes-styled-tab" data-tabs-target="#styled-themes" type="button" role="tab" aria-controls="themes" aria-selected="false">Themes</button>
      </li>
    </ul>

    <div id="default-styled-tab-content" class="font-blinker flex flex-wrap w-fit max-w-[1200px] text-lg text-gray-100 xl:border-s-2 border-gray-100 md:p-5">
      <?php
      get_template_part('template-parts/portfolio-grid', null, [
        'post_type'  => 'swd_site',
        'panel_id'   => 'styled-sites',
        'aria_label' => 'sites-tab',
      ]);
      get_template_part('template-parts/portfolio-grid', null, [
        'post_type'  => 'swd_block',
        'panel_id'   => 'styled-blocks',
        'aria_label' => 'blocks-tab',
        'hidden'     => true,
      ]);
      get_template_part('template-parts/portfolio-grid', null, [
        'post_type'  => 'swd_plugin',
        'panel_id'   => 'styled-plugins',
        'aria_label' => 'plugins-tab',
        'hidden'     => true,
      ]);
      get_template_part('template-parts/portfolio-grid', null, [
        'post_type'  => 'swd_theme',
        'panel_id'   => 'styled-themes',
        'aria_label' => 'themes-tab',
        'hidden'     => true,
      ]);
      ?>
    </div>
  </div>
</div>
<?php get_footer(); ?>

