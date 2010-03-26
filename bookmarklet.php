<?php
header('Content-Type: text/javascript');

header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past

// For bookmarklet.js
// Is the user using HTTPS?
$base_schema = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://';

// For bookmarklet.js
$base_domain = $base_schema . $_SERVER['HTTP_HOST'];

// For bookmarklet.js: :Complete the URL
$base_url = $base_domain . dirname($_SERVER['PHP_SELF']);

require('bookmarklet.js');
