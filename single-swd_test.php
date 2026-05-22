<?php
  global $wpdb;
  // wp_reset_query();
  $sanitizedQuery = $wpdb->prepare(
    "
    SELECT *
    FROM $wpdb->posts
    WHERE post_type = %s
    ",
    'swd_test'
  );
  $dbQuery = $wpdb->get_var($sanitizedQuery);
  var_dump($dbQuery);
  // var_dump($sanitizedQuery);
?>