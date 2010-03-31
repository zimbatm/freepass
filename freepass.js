(function(window) {
  var fp = {},
    charTable = [],
    t = true,
    topDomains = {
      "uk": {"co": t}
    };
  
  fp.extractDomain = extractDomain;
  fp.encode = encode;
  window.FreePass = fp;

  // See: http://www.asciitable.com/
  // All printable characters, except space
  // 19-20 characters generated with this table
  for (var i=33; i<127; i++) {
  	charTable.push(String.fromCharCode(i));
  }
  
  // TODO: strip sub-domains
  function extractDomain(str) {
  	// Remove scheme protocol
  	var md = /([a-z]+:\/\/)([^\/]+)/.exec(str);
  	if (md && md[2]) {
  		str = md[2];
  	}
  	
  	// Remove path
  	var i = str.indexOf("/")
  	if (i > -1) {
  	  str = str.substring(0, i);
  	}
  	
  	// Clean multiple-dots
  	str = str.replace(/\.+/, '.');
  	
  	/* Remove sub-domain. Here we have two cases. Certainly, we don't want all *.co.uk to have the same password.
  	This is why we loosely find the "TLD", then the next sub-domain and that's it. */
  	var arr = str.split('.'), keep = [], td = topDomains, d;
  	
  	while((d = arr.pop())) {
  	  if (td && td.hasOwnProperty(d)) {
  	    keep.push(d);
  	    td = td[d];
  	    if (typeof td !== "object") {
  	      td = null;
  	    }
  	  } else {
  	    keep.push(d);
  	    
        if (keep.length > 1) {
  	      break;
  	    }
  	  }
  	}
  	
  	return keep.reverse().join('.');
  }
  
  // Public
  function encode(pass, domain) {
    return sha1encode(pass + domain, charTable);
  }
  
})(this);

