<!DOCTYPE html>
<html>
<head>
	<style>

body {
	font-family: sans-serif;
	font-size: 120%;
}

body.framed {
	padding: 5px;
	margin: 0;
	font-size: 10pt;
}

body.framed #masterpw {
	width: 180px;
}

body.framed #domain {
	width: 180px;
}

body.framed .noframe { display: none; }

#freepass {
	background-color: #aabbcc;
	width: 20em;
}

#freepass label {
	display: ;
}

input { 
	/*border: 1px solid; */
}

	</style>
	<script src="http://code.jquery.com/jquery-1.4.2.min.js"></script>
	<script>
	
function noFrame() {
	
}	
	
jQuery(function($) {
	var form = $("form#freepass"),
		masterpw = $('#masterpw'),
		domain = $('#domain'),
		gen = $('#generate'),
		result = $('#result'),
		got_ev = null;
	
	// Detect if framed and set body.framed if true
	if (window === window.parent) {
		noFrame();
	} else {
		$(document.body).addClass("framed");
	}
	
	function listenForParent(ev) {
		domain.val(ev.origin);
		
		got_ev = ev;
		
		ev.source.postMessage(JSON.stringify({
			width: document.width,
			height: document.height
		}), ev.origin);
	}
	listenOnce(window, 'message', listenForParent, false);
	
	// Helper function
	function listenOnce(elem, type, callback, capture) {
		function wrap() {
			callback.apply(this, arguments);
			elem.removeEventListener(type, wrap, capture);
		}
		elem.addEventListener(type, wrap, capture);
	}
	
	function makePassword() {
		// Calulcate password
		var pw = masterpw.val() + domain.val();
		
		if (got_ev) { // Framed
			got_ev.source.postMessage(JSON.stringify({password: pw}), got_ev.origin);
		} else {
			// show result
			result.text(pw);
		}
	}
	
	form.submit(function(ev) {
		ev.stopPropagation();
		try {
			makePassword();
		} catch(err) { console.log(err); }
		return false;
	});
	
	masterpw.focus();
});
	</script>
</head>
<body>

<form id="freepass" onsubmit="return false">
	<label for="masterpw">Master password</label><input id="masterpw" type="password" autocomplete="off">
	<label for="domain">Domain</label><input id="domain" value="<?php $_SERVER['HTTP_REFERER'] ?>" autocomplete="off">
	
	<input id="generate" type="submit" value="generate">
	
	<div id="result"></div>
</form>

<div class="noframe">
<?php
	// Is the user using HTTPS?
	$base_url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == 'on') ? 'https://' : 'http://';
	// Complete the URL
	$base_url .= $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']);

?>
	<a id="bookmarklet" href="javascript:(function() {var d=document,db=d.body,s=d.createElement('script');s.src='<?php echo $base_url; ?>/bookmarklet.php';db.appendChild(s);window.setTimeout(function(){db.removeChild(s)},0)})();">FreePass</a>
</div>

<p>Prior art: <a href="http://supergenpass.com">supergenpass.com</a></p>

</body>
</html>
