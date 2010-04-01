<!DOCTYPE html>
<html>
<head>
	<title>FreePass 1.0 (alpha)</title>
	
	<link rel="stylesheet" href="freepass.css">
	
	<script src="js/jquery-1.4.2.js"></script>
	<script src="js/jquery.sha1.js"></script>
	<script src="js/jquery.sparkline.js"></script>
	<script src="js/jquery.hashmask.js"></script>
	<script src="freepass.js"></script>
	
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
	masterpw.focus();
	
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
	
	// Use referrer if available
	if (document.referrer && document.referrer.length > 0) {
		debug("Got url from referrer: " + document.referrer);
		domain.val(fp.extractDomain(document.referrer));
	}
	
	// 
	form.submit(function(ev) {
		ev.stopPropagation();
		try {
			makePassword();
		} catch(err) { debug(err); }
		return false;
	});
	
	function listenForParent(ev) {
		// Once
		if (!parent) {
			debug("Got url from parent window/frame: " + ev.origin);
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
	
	// Build bookmarklet on demand
	$("#bookmarklet").one("click", function() {
		var url = window.location.href,
			domain = fp.extractDomain(url),
			fid = "fp" + $.sha1((new Date) + '')
			fwid = "fp" + $.sha1((new Date) + "xxx");
			
		debug("Building bookmarklet with:", url, domain, fid, fwid);
		
		$(this).text("Building...");
		
		$.get('bookmarklet.min.js', {}, function(data) {
			var src = data;
			
			src = src.replace('${homeUrl}', url);
			src = src.replace('${homeDomain}', domain);
			src = src.replace('${fid}', fid);
			src = src.replace('${fwid}', fwid);
			
			$("#bookmarklet").attr("href", 'javascript:' + src);
			$("#bookmarklet").text("FreePass");
			
		}, 'text/plain');
		
	});
});
	</script>
</head>
<body>

<span id="frame-warning">Your window is framed, security attack !</span>

<div id="content">
<form id="freepass" onsubmit="return false">
	<label for="masterpw">Master password</label><input id="masterpw" type="password">
	<label for="domain">Domain</label><input id="domain" autocomplete="off">
	
	<input type="checkbox" id="subdomain" checked>
	<label for="subdomain">strip subdomain</label>
	
	<input id="generate" type="submit" value="generate">
	
	<div id="result">&nbsp;</div>
</form>

<div id="info">
	<p>Bookmarklet: <a id="bookmarklet" href="#">Click to generate</a> (then drag it in your bookmark bar)</p>
	
	<p>Source code: <a href="http://github.com/zimbatm/freepass">http://github.com/zimbatm/freepass</a></a>
</div>

<div id="debug">
	Debug:
</div>
</div>

</body>
</html>
