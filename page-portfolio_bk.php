<?php get_header(); ?>

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

    <!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>

<?php get_footer(); ?>

