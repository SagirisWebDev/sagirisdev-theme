<?php 
  wp_list_comments(
    array(
      'style' => 'div'
    )
  );

  if(comments_open()){
    comment_form(
      array(
        'class_form' => '',
        'title_reply_before' => '',
        'title_reply_after' => '',
      )
      );
  }
?>
