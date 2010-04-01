// Depends: jquery.sha1.js
(function(window, $) {
  var fp = {},
    charTable = [],
    t = true,
    tlds = "co.uk|co.ck",
    tldsRe = new RegExp("(" + tlds.replace("." ,"\\.") + ")$");
  
  fp.extractDomain = extractDomain;
  fp.encode = encode;
  window.FreePass = fp;

  // See: http://www.asciitable.com/
  // All printable characters, except space
  // 24 characters generated with this table
  for (var i=33; i<127; i++) {
  	charTable.push(String.fromCharCode(i));
  }
  
  // Extract domain from a string
  // @param string str
  // @param bool nosubdomain true if you want to strip the subdomain
  // @return string
  function extractDomain(str, nosubdomain) {
    var md;
    
    // downcase
    str = str.toLowerCase();
    
    // trim
    str = str.replace(/^\s+|\s+$/g,"");
    
  	// Remove scheme protocol, port and path
  	md = /^([a-z]+:\/\/)([^\/:]+)/.exec(str)
  	if (md && md[2]) {
  		str = md[2];
  	} else {
  	  md = /^([^\/:]+)/.exec(str)
  	  if (md && md[1]) str = md[1];
  	}
  	
  	// Eventually, clean multiple-dots for typos
  	str = str.replace(/\.+/, '.');
  	
  	if (nosubdomain) {
  	  
  	  // Skip if the loosely-matching ip address is found
  	  if (/^\d+\.\d+\.\d+\.\d+$/.test(str)) return str;
  	  // TODO: match IPv6 addresses
  	  
  	  var arr = str.split('.'), tld, dom;
  	  
  	  md = tldsRe.exec(str);
  	  if (md && md[1]) {
  	    tld = md[1];
  	    arr.pop();
  	    arr.pop();
  	  } else {
  	    tld = arr.pop();
  	  }
  	  
  	  if (arr.length > 0) {
  	    str = arr.pop() + '.' + tld;
  	  } else {
  	    str = tld;
  	  }
  	}
  	
  	return str;
  }
  
  function intToCharTable(num, charTable) {
  	var str="",
  		ct = charTable,
  		len = ct.length,
  		v = Math.abs(num),
  		ret;
  	while(v > len) {
  	  ret = v % len;
  	  v = Math.floor(v / len);
  	  str += ct[ret];
  	}
  	return str;
  }
  
  // Public
  // @param string pass
  // @param string domain
  // @param int maxLen in the range of 1-20
  function encode(pass, domain, maxLen) {
    var sha1 = $.sha1(pass + domain),
      num = parseInt(sha1, 16),
      newPass = intToCharTable(num, charTable);
      
    if (!maxLen) maxLen = 10;
    
    newPass = newPass.substring(0, maxLen);
      
    return newPass;
  }
  
})(this, jQuery);

