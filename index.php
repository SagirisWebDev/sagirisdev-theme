<body>
<?php get_header(); ?>
  <main class="relative max-w-[1350px] w-[80%] mx-auto mt-8">
    <div class="container portfolio">
        <?php 
            if ( have_posts() ) {
                while( have_posts() ) {
                    the_post();
                    the_title();
                    the_content();

                    get_template_part('template-parts/content', 'archive');
                }

                esc_html_e('The index.php template');
            }
        ?>
    </div>

<?php get_footer(); ?>
</body>