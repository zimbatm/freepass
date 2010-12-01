// It's here as a reference
(function(window){
  var doc=window.document, f = doc.createElement('form');
  f.href='${loc}';
  f.style='visibility:hidden';
  f.target='_blank';
  doc.body.appendChild(f);
  f.submit();
})(this);