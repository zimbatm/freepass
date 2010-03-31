<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="freepass.css">
	<script src="http://code.jquery.com/jquery-1.4.2.js"></script>
	<script src="js/sha1.js" type="text/javascript"></script>
	<script src="freepass.js" type="text/javascript"></script>
	
	<script type="text/javascript" src="js/hashmask/jquery.sha1.js"></script>
	<script type="text/javascript" src="js/hashmask/jquery.sparkline.js"></script>
	<script type="text/javascript" src="js/hashmask/jquery.hashmask.js"></script>
	
	<script>

function debug() {
	var d = $("#debug");
	for (var i=0; i<arguments.length; i++) {
		d.append("<div>" + arguments[i] + "</div>");
	}
}

function isFramed() {
	// or: top !== self
	if (window !== window.parent);
}

jQuery(function($) {
	var fp = window.FreePass,
		form = $("form#freepass"),
		masterpw = $("#masterpw"),
		domain = $("#domain"),
		subdomain = $("#subdomain"),
		gen = $("#generate"),
		result = $("#result"),
		parent, parent_origin;
	
	// Detect if framed, big warning
	if (isFramed()) {
		$(document.body).addClass("framed");
	}
	
	// Apply hashmask plugin
	masterpw.hashmask();
	
	// Detect if openend by client (window.open())
	if (window.opener) {
		
		//debug(window.opener.location.href); // Not allowed
		
		// Handshake to say it is loaded
		try {
			// TO: whomever called me
			window.opener.postMessage("hello", "*");
			debug("called from bookmarklet, notifying parent");
		} catch(err) {
			debug("Browser doesn't support the postMessage API");
		}
	}
	
	try {
		window.addEventListener("message", listenForParent, false);
	} catch(err) {
		debug("Browser doesn't support the postMessage API");
	}
	
	function listenForParent(ev) {
		// Once
		if (!parent) {
			debug("parent url is: " + ev.origin);
			domain.val(fp.extractDomain(ev.origin));
			parent = ev.source;
			parent_origin = ev.origin;
		}
	}
	
	function makePassword() {
		var d = fp.extractDomain(domain.val(), subdomain.attr("checked"));
		
		domain.val(d);
		
		// Calulcate password
		var pw = fp.encode(masterpw.val(), d);
		
		if (parent) { // Framed
			parent.postMessage(JSON.stringify({password: pw}), parent_origin);
			parent.focus();
		}
		
		result.text(pw);
	}
	
	form.submit(function(ev) {
		ev.stopPropagation();
		try {
			makePassword();
		} catch(err) { debug(err); }
		return false;
	});
	
	masterpw.focus();
});
	</script>
</head>
<body>

<span id="frame-warning">Your window is framed, security attack !</span>

<form id="freepass" onsubmit="return false">
	<label for="masterpw">Master password</label><input id="masterpw" type="password">
	<label for="domain">Domain</label><input id="domain" value="<?php $_SERVER['HTTP_REFERER'] ?>" autocomplete="off">
	
	<input type="checkbox" id="subdomain" checked>
	<label for="subdomain">strip subdomain</label>
	
	<input id="generate" type="submit" value="generate">
	
	<div id="result">&nbsp;</div>
</form>

<div id="info">
<?php
	// For bookmarklet.js
// Is the user using HTTPS?
$base_schema = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://';

// For bookmarklet.js
$base_domain = $base_schema . $_SERVER['HTTP_HOST'];

// For bookmarklet.js: :Complete the URL
$base_url = $base_domain . dirname($_SERVER['PHP_SELF']);
	
	ob_start();
	require('bookmarklet.min.js');
	$bookmarklet = ob_get_contents();
	ob_end_clean();
	
?>

	Bookmarklet: <a id="bookmarklet" href="javascript:<?php echo htmlentities($bookmarklet); ?>">FreePass</a> (<a href="javascript:(function(){alert('todo')})()">Lite</a>)
</div>

<div id="debug">
	Debug:
	
</div>

</body>
</html>
