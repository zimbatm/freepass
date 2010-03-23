// TODO: when we get the password, fill password fields on double-click
// TODO: give better names to functions, make it more readable
// NOTE: we're only using W3C methods and old/insecure browser will fail but who cares ?
(function(global) {
  var home_url = "<?php echo $base_url; ?>"
  
  // Check if page is available
  if (!global || !global.document) {
    global.location = home_url;
  }
  
  // Don't run twice
  if (document.getElementById("_freepass_")) return;
  
  // Init dom elements
  var doc = global.document,
    box = doc.createElement("div"),
      title = doc.createElement("div"),
        bye = doc.createElement("input"),
      chan = doc.createElement("iframe"),
    insertList = [], insertEvent = false,
    s, currentPassword;
  
  box.id="_freepass_"
  merge(box.style, {
    padding: 0,
    margin: 0,
    border: '1px solid #aaaaaa',
    //background: '#D1775F',
    font: 'normal 10px sans-serif',
    position: 'fixed',
    top: '10px',
    right: '10px',
    width: '200px'
  });
  
  merge(title.style, {
    textAlign: 'right',
    background: '#aabbcc',
    width: '100%',
    font: 'inherit'
  });
  title.onmousedown = evDrag;
    
  merge(bye.style, {
    border: 0,
    background: '#99aabb',
    font: 'inherit',
    float: 'right',
    height: '20px',
    width: '20px',
    top: '-10px'
  });
  bye.type = "button";
  bye.value = "x";
  bye.onclick = evBye;
    
  merge(chan.style, {
   padding: 0,
   margin: 0,
   border: 0,
   width: '200px',
   height: '136px',
   scroll: 'no-scroll',
   overflow: 'hidden'
  });
  chan.src = home_url;
  chan.onload = evLoad;
  
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
  
  function evDrag(ev) {
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
  
  function evBye(ev) {
    evStop(ev);
    global.removeEventListener("message", gotMessage, false);
    if (insertEvent) {
    	doc.removeEventListener("dblclick", insertPassword, true);
    	insertedClear();
    }
    doc.body.removeChild(box);
  }
  
  function evLoad(ev) {
    chan.contentWindow.postMessage("hello", "<?php echo $base_domain ?>");
  }
  
  function insertPassword(ev) {
    var t = ev.target, prevCss;
  	if (t.nodeName.toLowerCase() === "input" && t.type === "password") {
  	  if (!insertCheck(t)) {
  	  	prevCss = t.style.cssText;
  	  	merge(t.style, {backgroundColor: '#ddffdd'});
  	  	t.value = currentPassword;
  	  	insertList.push({elem: t, prevCss: prevCss});
  	  } 
  	}
  }
  
  function insertCheck(elem) {
  	for (var i=0; i<insertList.length; i++) {
  		if (insertList[i].elem === elem) return true;
  	}
  	return false;
  }
  
  function insertedClear() {
    var obj;
  	while(obj = insertList.pop()) {
  		obj.elem.style.cssText = obj.prevCss;
  	}
  }

  function gotMessage(ev) {
    var obj = JSON.parse(ev.data);
    
    // THINK: other data ?
    
    if (obj.password) { // Got password
      currentPassword = obj.password;
      
      if (!insertEvent) {
      	doc.addEventListener("dblclick", insertPassword, true);
      	insertEvent = true;
      } else {
      	insertedClear();
      }
    }
  }
  global.addEventListener("message", gotMessage, false);
})(this);