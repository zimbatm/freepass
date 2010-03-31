<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="freepass.css">
	<script src="http://code.jquery.com/jquery-1.4.2.min.js"></script>
	<script src="js/sha1.js" type="text/javascript"></script>
	<script src="freepass.js" type="text/javascript"></script>
	<script>

function debug() {
	if (typeof console === "undefined") {
		alert(arguments[0]);
	} else {
		console.log.apply(console.log, arguments);
	}
}

function isFramed() {
	// or: top !== self
	if (window !== window.parent);
}

jQuery(function($) {
	var fp = window.FreePass,
		form = $("form#freepass"),
		masterpw = $('#masterpw'),
		domain = $('#domain'),
		gen = $('#generate'),
		result = $('#result'),
		parent, parent_origin;
		
	// Detect if framed, big warning
	if (isFramed()) {
		$(document.body).addClass("framed");
	}
	
	// Detect if openend by client (window.open())
	if (window.opener) {
		// We got called from bookmarklet
		debug("called from bookmarklet", window.opener);
		//debug(window.opener.location.href); // Not allowed
		// Handshake to say it is loaded
		// TO: whomever called me
		window.opener.postMessage("hello", "*");
	}
	
	window.addEventListener("message", listenForParent, false);
	
	function listenForParent(ev) {
		// Once
		if (!parent) {
			domain.val(fp.extractDomain(ev.origin));
			parent = ev.source;
			parent_origin = ev.origin;
		}
	}
	
	function makePassword() {
		var d = fp.extractDomain(domain.val());
		
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

</body>
</html>
