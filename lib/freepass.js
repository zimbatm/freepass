var sha1 = require('./sha1'),
  BigInteger = require('./biginteger').BigInteger,
  extractURL = require('publicsuffix').extractURL;

var fp = exports,
  charTable = [];
  
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
// @return triplet [prefix, domain, postfix]
function extractDomain(str) {
  var split = extractURL(str);
  split[1] = split[1].toLowerCase();
  return split;
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


