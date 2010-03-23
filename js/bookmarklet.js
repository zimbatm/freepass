// TODO: remove jQuery dependency
// TODO: check if there is a page available
// TODO: when we get the password, fill password fields on double-click
// TODO: $(box).draggable();

// NOTE: we're only using W3C methods and old/insecure browser will fail but who cares ?
(function(global) {
  var home_url = "<?php echo $base_url; ?>"
  if (!global || !global.document) {
    global.location = home_url;
  }
  
  // Don't run twice
  if (document.getElementById("_freepass_")) return;
  
  var doc = global.document,
    box = doc.createElement("div"),
    title = doc.createElement("div"),
    bye = doc.createElement("input"),
    chan = doc.createElement("iframe"),
    s;
  
  box.id="_freepass_"
  merge(box.style, {
    padding: 0,
    margin: 0,
    border: '1px solid #EB976A',
    background: '#D1775F',
    font: 'normal 10px sans-serif',
    position: 'fixed',
    top: '10px',
    right: '10px',
    width: '200px'
  });
  
  merge(title.style, {
    textAlign: 'right',
    background: '#732D62',
    width: '100%',
    font: 'inherit'
  });
  title.innerHTML = "FreePass&nbsp;";
  title.onmousedown = function(ev) {
    var diffX = ev.clientX - box.offsetLeft,
      diffY = ev.clientY - box.offsetTop;
    evStop(ev);
    
    function follow(ev) {
      evStop(ev);
      
      box.style.left = ev.clientX - diffX + 'px';
      box.style.top = ev.clientY - diffY + 'px';
    }
    evOnce(doc, "mouseup", function(ev) {
      follow(ev); // Last chance to position
      doc.removeEventListener("mousemove", follow, false);
    });
    doc.addEventListener("mousemove", follow, false);
  }
  
  merge(bye.style, {
    border: 'none',
    background: '#A14788',
    font: 'inherit',
    height: '20px',
    width: '20px'
  });
  bye.type = "button";
  bye.value = "x";
  bye.onclick = function(ev) {
    evStop(ev);
    global.removeEventListener("message", gotMessage, false);
    doc.body.removeChild(box);
  };
  
  merge(chan.style, {
   padding: 0,
   margin: 0,
   border: 0,
   width: '200px',
   height: '150px',
   scroll: 'no-scroll',
   overflow: 'hidden'
  });
  chan.src = home_url;
  chan.onload = function(ev) {
    chan.contentWindow.postMessage("hello", "<?php echo $base_domain ?>");
  };

  title.appendChild(bye);
  box.appendChild(title);
  box.appendChild(chan);
  doc.body.appendChild(box);

  function merge(target, src) {
    for(k in src) {
      if (src.hasOwnProperty(k)) target[k] = src[k];
    }
  }

  function evStop(ev) {
    ev.stopPropagation();
    ev.preventDefault();
  }
  
  function evOnce(obj, type, fn) {
    function wrap() {
      fn.apply(this, arguments);
      obj.removeEventListener(type, wrap, false);
    }
    obj.addEventListener(type, wrap, false);
  }

  function gotMessage(ev) {
    var obj = JSON.parse(ev.data);
    console.log(obj);
    
    /*if (obj.width) {
      console.log(chan.style.width);
      chan.style.width = obj.width + 10 + 'px';
      box.style.width = obj.width + 10 + 'px';
      console.log(chan.style.width);
    }
    
    if (obj.height) {
      chan.style.height = obj.height + 'px';
      box.style.height = obj.height + 'px';
    }*/
    
    if (obj.password) { // Got password
      doc.body.innerHTML += "<span>Password is: " + ev.data + "</span>";
    }
  }
  global.addEventListener("message", gotMessage, false);
})(this);