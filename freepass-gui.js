
function debug() {
	var d = $("#debug");
	for (var i=0; i<arguments.length; i++) {
		d.append("<div>" + arguments[i] + "</div>");
	}
}

function isFramed() {
	// or: top !== self
	return (window !== window.parent);
}

jQuery(function($) {
	var fp = window.FreePass,
		form = $("form#freepass"),
		masterpw = $("#masterpw"),
		domain = $("#domain"),
		subdomain = $("#subdomain"),
		subdomainLabel = $("label[for=subdomain]"),
		result = $("#result"),
		parent, parent_origin;
	
	// Detect if framed, big warning
	if (isFramed()) {
		$(document.body).addClass("frame-alert");
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
		updateDomain(document.referrer);
	}
	
	
	$(document).keydown(function (ev) {
		if (ev.which === 16 && parent) {
			switchMode("standalone");
		}
	});
	
	$(document).keyup(function (ev) {
		if (ev.which === 16 && parent) {
			switchMode("connected");
		}
	});
	// 
	form.submit(function(ev) {
		ev.stopPropagation();
		try {
			updateDomain();
			makePassword();
		} catch(err) { debug(err); }
		return false;
	});
	
	function updateDomain(val) {
		if (subdomain.attr("checked")) {
			if (!val) val = domain.val();
			if (val !== "") {
				var short = fp.extractDomain(val, true);
				if (val !== short) subdomainLabel.text( val );
				domain.val(short);
			}
		} else if (val) {
			domain.val(val);
		}
	};
	domain.change(function() {
		updateDomain();
	});
	
	subdomain.change(function () {
		var $this = $(this);
		if ($this.attr("checked")) {
			updateDomain();
		} else {
			// Restore
			var oldText = $.data(subdomainLabel, "old-text"),
				oldDomain = subdomainLabel.text();
				
			if (oldText !== oldDomain) domain.val( oldDomain );
			
			subdomainLabel.text( oldText );
		}
	});
	$.data(subdomainLabel, "old-text", subdomainLabel.text());
	
	function listenForParent(ev) {
		// Once
		if (!parent) {
			debug("Got url from parent window/frame: " + ev.origin);
			updateDomain(ev.origin);
			parent = ev.source;
			parent_origin = ev.origin;
			
			switchMode("connected");
		}
	}
	
	function makePassword() {
		var d = domain.val(),
			pw = fp.encode(masterpw.val(), d);
		
		if (parent) { // Framed
			parent.postMessage(JSON.stringify({password: pw}), parent_origin);
		}
		
		if (shouldClose()) {
			window.close();
		} else {
			if (parent) parent.focus();
			result.val(pw);
		}
	}
	
	result.dblclick(function() { this.select(); });
	
	// Show git HEAD commit id on website
	$.get('.git/HEAD', function(data) {
		// Extract head ref
		var head = data.slice(5);
		$.get('.git/' + head, function(hashid) {
			// Truncate at 8 chars
			$("#hashid").text('(commit: ' + hashid.slice(0, 10) + ')');
		});
	});
	
	$("#standalone-button").click(function (ev) {
		ev.preventDefault();
		this.blur();
		switchMode("standalone");
	});
	
	$("#connected-button").click(function (ev) {
		ev.preventDefault();
		this.blur();
		if (parent) {
			switchMode("connected");
		} else {
			switchMode("connected-help");
			buildBookmarklet($("#bookmarklet"));
		}
	});
	
	function switchMode(newMode) {
		var $c = $("#content");
		$c.removeClass("standalone-mode connected-mode connected-help-mode");
		$c.addClass(newMode + "-mode");
	}
	
	function shouldClose() {
		var $c = $("#content");
		return $("#content").hasClass("connected-mode");
	}
	
	// Build bookmarklet
	// TODO: if it fails, lookup in the page for a <script type="text/bookmarklet">
	function buildBookmarklet(elem) {
		var l = window.location,
			domain = l.protocol + '//' + l.hostname,
			url = domain + l.pathname,
			$bookmarklet = $(elem);
		
		debug("Building bookmarklet for:", url, domain);
		
		$bookmarklet.text("Building...");
		
		$.get('bookmarklet.min.js', function(data) {
			var src = data;
			
			src = src.replace(/\${homeUrl}/g, url);
			src = src.replace(/\${homeDomain}/g, domain);
			
			$bookmarklet.attr("href", 'javascript:' + src);
			$bookmarklet.text("FreePass");
			$bookmarklet.click(function(ev) {
				ev.preventDefault();
			});
			
		}, 'text/plain');
	}
});