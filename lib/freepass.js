var sha1 = require('sha1'),
  BigInteger = require('biginteger').BigInteger;

var fp = exports,
  charTable = [],
  tlds = "co.uk|co.ck",
  tldsRe = new RegExp("(" + tlds.replace("." ,"\\.") + ")$");

fp.charTable = charTable;
fp.extractDomain = extractDomain;
fp.encode = encode;

// See: http://www.asciitable.com/
/*for (var i=48; i<=57; i++) { // 0-9
	charTable.push(String.fromCharCode(i));
}
for (var i=65; i<=90; i++) { // A-Z
	charTable.push(String.fromCharCode(i));
}
for (var i=97; i<=122; i++) { // a-z
	charTable.push(String.fromCharCode(i));
}
charTable.push.apply(charTable, "./-".split(""));*/

// All printable characters
for (var i=33; i<=126; i++) {
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

function hexToCharTable(hex, charTable) {
	var str="",
		ct = charTable,
		base = ct.length,
		num = BigInteger.parse(hex, 16);
	
	while(!num.isZero()) {
	  var divmod = num.divRem(base);
	  num = divmod[0];
	  str = ct[divmod[1]] + str; // right-to-left
	}
	
	return str;
}

// Public
// @param string pass
// @param string domain
// @param int maxLen in the range of 1-20
// @return string
function encode(pass, domain, maxLen) {
  var _sha1 = sha1.hexdigest(pass + domain),
    newPass = hexToCharTable(_sha1, charTable);
    
  if (!maxLen) maxLen = 10;
  
  newPass = newPass.substring(0, maxLen);
    
  return newPass;
}


