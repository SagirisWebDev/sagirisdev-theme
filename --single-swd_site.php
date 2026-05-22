<?php get_header(); ?>

    <div class="container site-container my-4">
        <?php 
            if ( have_posts() ) {
                while( have_posts() ) {
                    the_post();

                    function display_pic_and_title($content){
                        $content = explode('<p class="post-details', $content);
                        
                        return $content[0];
                    }

                    add_filter('the_content', 'display_pic_and_title');

                    the_content();

                    $splitContent = explode('</p>', get_the_content());
        ?>
            <div class="accordion" id="accordionExample">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                            Features
                        </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                            <?php print($splitContent[0]);?>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingTwo">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                            Graphics
                        </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                        <?php print($splitContent[1]);?>
                        </div>
                    </div>
                </div>
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingThree">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                            SEO
                        </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                        <?php print($splitContent[2]);?>
                        </div>
                    </div>
                </div>
            </div>
            <?php print($splitContent[3]);?>
            <!-- Close divs that were opened by the_content, but never closed due to explode function -->
                </div> 
                </div>
                </div>
            <?php
                }
            }
?>
        
    </div>

<?php get_footer(); ?>