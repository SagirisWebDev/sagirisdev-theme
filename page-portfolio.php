<?php get_header(); ?>
<main class="relative max-w-[1350px] mx-auto mt-8">
<div class="container-sm mb-5">
  <h1 class="font-bank-gothic text-4xl rounded-1 text-gray-300 max-w-96 border-b-3 border-gray-100 pb-3 ps-3 mx-6 mb-8"><?php the_title(); ?></h1>
  <div class="flex flex-wrap justify-start w-full md:ms-5 p-5">
    <ul class="relative before:content[''] before:absolute before:bg-gray-100 before:min-w-xs before:w-3/7 before:h-[2px] before:-bottom-px before:left-0 xl:before:h-0 font-blinker flex flex-wrap justify-start items-center w-[100%] xl:w-fit xl:flex-col xl:flex-nowrap xl:justify-start gap-5 text-xl text-center mb-4 rounded-1" id="default-styled-tab" data-tabs-toggle="#default-styled-tab-content" role="tablist" data-tabs-active-classes="text-purple-400 border-purple-400 hover:text-purple-200 hover:border-purple-200" data-tabs-inactive-classes="text-gray-300 border-0 hover:text-purple-200">
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 border-b-3 rounded-t-lg cursor-pointer" id="sites-styled-tab" data-tabs-target="#styled-sites" type="button" role="tab" aria-controls="sites" aria-selected="false">Sites</button>
      </li>
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 border-b-3 rounded-t-lg cursor-pointer" id="blocks-styled-tab" data-tabs-target="#styled-blocks" type="button" role="tab" aria-controls="blocks" aria-selected="false">Blocks</button>
      </li>
      <li class="me-2" role="presentation">
        <button class="inline-block p-4 border-b-3 rounded-t-lg cursor-pointer" id="plugins-styled-tab" data-tabs-target="#styled-plugins" type="button" role="tab" aria-controls="plugins" aria-selected="false">Plugins</button>
      </li>
    </ul>

    <div id="default-styled-tab-content" class="font-blinker flex flex-wrap w-fit max-w-[1200px] text-lg text-gray-100 xl:border-s-2 border-gray-100 md:p-5">
    <div id="styled-sites" role="tabpanel" aria-labelledby="sites-tab">
      <div class="wp-row flex flex-wrap justify-center items-center gap-0.5">
        <div class="wp-query-loop">
          <ul class="wp-post-template flex flex-wrap justify-start gap-8">

          <?php
          $args = [
            'post_type' => 'swd_site',
            'posts_per_page' => 6,
          ];
          $sites_query = new WP_Query($args);
          if ( $sites_query -> have_posts() ) {
            while ( $sites_query -> have_posts() ) {
              $sites_query -> the_post();
              ?>

              <li class="wp-post md:cont-wrap post-<?php echo esc_attr(the_ID()); ?> swd_site type-swd_site status-publish format-standard">
                <a href="<?php the_permalink() ?>">
                  <figure class="post-featured-img">
                    <img class="attachment-post-thumbnail size-post-thumbnail wp-post-image" src="<?php the_post_thumbnail_url('original'); ?>" alt="<?php echo get_post_meta( get_post_thumbnail_id(), '_wp_attachment_image_alt', true ); ?>" style="object-fit: cover;" />
                  </figure>
                  <h2 class="post-title font-bank-gothic font-semibold text-xl">
                    <?php the_title(); ?>
                  </h2>
                </a>
              </li>
              
              <?php
            }
          }
          wp_reset_postdata();
          ?>

          </ul>
        </div>
      </div>
    </div>
    <div class="hidden" id="styled-blocks" role="tabpanel" aria-labelledby="blocks-tab">
      <div class="wp-row flex flex-wrap justify-center items-center gap-0.5">
        <div class="wp-row flex flex-wrap justify-center items-center gap-0.5">
          <div class="wp-query-loop">
            <ul class="wp-post-template flex flex-wrap justify-start pt-4 gap-8">
            <?php
            $args = [
              'post_type' => 'swd_block',
              'posts_per_page' => 6,
            ];
            $blocks_query = new WP_Query($args);
            if ( $blocks_query -> have_posts() ) {
              while ( $blocks_query -> have_posts() ) {
                $blocks_query -> the_post();
                ?>

                <li class="wp-post md:cont-wrap post-<?php echo esc_attr(the_ID()); ?> swd_block type-swd_block status-publish format-standard">
                  <a href="<?php the_permalink() ?>">
                    <figure class="post-featured-img">
                      <img class="attachment-post-thumbnail size-post-thumbnail wp-post-image" src="<?php the_post_thumbnail_url(); ?>" alt="<?php echo get_post_meta( get_post_thumbnail_id(), '_wp_attachment_image_alt', true ); ?>" style="object-fit: cover;" />
                    </figure>
                    <h2 class="post-title font-bank-gothic font-semibold text-xl text-center">
                      <?php the_title(); ?>
                    </h2>
                  </a>
                </li>

                <?php
              }
            }
            wp_reset_postdata();
            ?>

            </ul>
          </div>
        </div>
      </div>
    </div>
    <div class="hidden" id="styled-plugins" role="tabpanel" aria-labelledby="plugins-tab">
      <div class="wp-row flex flex-wrap justify-center items-center gap-0.5">
        <div class="wp-query-loop">
        <ul class="wp-post-template flex flex-wrap justify-start gap-8">

        <?php
        $args = [
          'post_type' => 'swd_plugin',
          'posts_per_page' => 6,
        ];
        $plugins_query = new WP_Query($args);
        if ( $plugins_query -> have_posts() ) {
          while ( $plugins_query -> have_posts() ) {
            $plugins_query -> the_post();
            ?>

            <li class="wp-post md:cont-wrap post-<?php echo esc_attr(the_ID()); ?> swd_block type-swd_block status-publish format-standard">
              <a href="<?php the_permalink() ?>">
                <figure class="post-featured-img">
                  <img class="attachment-post-thumbnail size-post-thumbnail wp-post-image" src="<?php the_post_thumbnail_url(); ?>" alt="<?php echo get_post_meta( get_post_thumbnail_id(), '_wp_attachment_image_alt', true ); ?>" style="object-fit: cover;" />
                </figure>
                <h2 class="post-title font-bank-gothic font-semibold text-xl">
                  <?php the_title(); ?>
                </h2>
              </a>
            </li>
            
            <?php
          }
        }
        wp_reset_postdata();
        ?>

        </ul>
        </div>
      </div>
    </div>
    </div>
  </div>
</div>
<?php get_footer(); ?>

