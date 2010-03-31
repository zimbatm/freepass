<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" href="freepass.css">
	<script src="http://code.jquery.com/jquery-1.4.2.min.js"></script>
	<script src="js/sha1.js" type="text/javascript"></script>
	<script>

var charTable = [];

// See: http://www.asciitable.com/
// All printable characters, except space
// 19-20 characters generated with this table
for (var i=33; i<127; i++) {
	charTable.push(String.fromCharCode(i));
}

function debug() {
	if (typeof console === "undefined") {
		alert(arguments);
	} else {
		console.log.apply(console.log, arguments);
	}
}

function isFramed() {
	// or: top !== self
	return window !== window.parent;
}

jQuery(function($) {
	var form = $("form#freepass"),
		masterpw = $('#masterpw'),
		domain = $('#domain'),
		gen = $('#generate'),
		result = $('#result'),
		parent, got_ev;
		
	// Detect if framed and set body.framed if true
	if (isFramed()) {
		debug("is framed");
		$(document.body).addClass("framed");
		$(".noframe").hide(); // TODO: fix css instead
		// TODO: prevent framing instead
	}
	
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
		domain.val(ev.origin);
		got_ev = ev;
	}
	
	// TODO: strip sub-domains
	function getDomain(str) {
		md = /([a-z]+:\/\/)([^\/]+)/.exec(str);
		if (md && md[2]) {
			return md[2];
		} else {
			return str;
		}
	}
	
	function makePassword() {
		var d = getDomain(domain.val());
		
		domain.val(d);
		
		// Calulcate password
		var pw = sha1encode(masterpw.val() + d, charTable);
		
		if (got_ev) { // Framed
			got_ev.source.postMessage(JSON.stringify({password: pw}), got_ev.origin);
			got_ev.source.focus();
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

<form id="freepass" onsubmit="return false">
	<label for="masterpw">Master password</label><input id="masterpw" type="password">
	<label for="domain">Domain</label><input id="domain" value="<?php $_SERVER['HTTP_REFERER'] ?>" autocomplete="off">
	
	<input id="generate" type="submit" value="generate">
	
	<div id="result">&nbsp;</div>
</form>

<div class="noframe">
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
