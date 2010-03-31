(function(window) {
  var fp = {},
    charTable = [];

  // CommonJS module
  if (typeof exports !== "undefined") fp = exports;

  // See: http://www.asciitable.com/
  // All printable characters, except space
  // 19-20 characters generated with this table
  for (var i=33; i<127; i++) {
  	charTable.push(String.fromCharCode(i));
  }
  
  // TODO: strip sub-domains
  function extractDomain(str) {
  	md = /([a-z]+:\/\/)([^\/]+)/.exec(str);
  	if (md && md[2]) {
  		return md[2];
  	} else {
  		return str;
  	}
  }
  fp.extractDomain = extractDomain;
  
  function encode(pass, domain) {
    return sha1encode(pass + domain, charTable);
  }
  fp.encode = encode;
  
  window.FreePass = fp;
})(this);

