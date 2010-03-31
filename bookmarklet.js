// TODO: look for password fields in iframes
// TODO: give better names to functions, make it more readable
// NOTE: we're only using W3C methods and old/insecure browser will fail but who cares ?
(function(window) {
  var doc = window.document,
    homeUrl = "<?php echo $base_url; ?>",
    homeDomain = "<?php echo $base_domain; ?>",
    fid = "fp<?php echo sha1(time()); ?>",
    pwColor = "#ddffdd",
    addEv = "addEventListener", remEv = "removeEventListener",
    insertList = [], insertEvent = false,
    child, childRef, box, msg, bye, currentPassword;
  
  // Check if page is available
  if (!window || !window.document) {
    window.location = homeUrl;
    return;
  }
  
  // Don't run twice
  if (document.getElementById(fid)) return;
  
  // Build GUI  
  box = doc.createElement("div");
  box.id=fid;
  merge(box.style, {
    padding: 0,
    margin: 0,
    border: "1px solid #aaaaaa",
    font: "normal 12px",
    fontFamily: "Trebuchet MS, Helvetica, Arial, sans-serif",
    textAlign: "right",
    position: "fixed",
    top: "10px",
    left: "10px",
    //width: "200px",
    color: "#333333",
    background: "#99aabb",
    zIndex: "1000000"
  });
  box[addEv]("mousedown", evDrag, false);
  
  msg = doc.createElement("span");
  merge(msg.style, {
    marginLeft: "2em",
    marginRight: "2em"
  });
  msg.innerHTML = "FreePass";
  
  bye = doc.createElement("input");
  merge(bye.style, {
    margin: 0,
    padding: 0,
    border: 0,
    color: "inherit",
    background: "inherit",
    font: "inherit",
    borderRight: "1px solid #aaaaaa"
  });
  bye.type = "button";
  bye.value = "x";
  bye[addEv]("click", evBye, false);
  
  box.appendChild(bye);
  box.appendChild(msg);
  doc.body.appendChild(box);

  // Listen for eventual child messages
  window[addEv]("message", gotMessage, false);

  // Open freepass window (if possible)
  openChild();
  
  /*
  *  Functions
  */

  function openChild() {
    if (childRef && (!child || !child.closed)) return;
    childRef = null;
    child = window.open(homeUrl, fid);
  }
  
  function debug() {
    if (typeof window.console !== "undefined") {
      console.log.apply(console.log, arguments);
    }
  }

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
      obj[remEv](type, wrap, false);
    }
    obj[addEv](type, wrap, false);
  }
  
  function evDrag(ev) {
    var diffX = ev.clientX - box.offsetLeft,
      diffY = ev.clientY - box.offsetTop;
    evStop(ev);
    
    if (!child) { openChild(); return }
    
    function follow(ev) {
      evStop(ev);
      
      box.style.left = ev.clientX - diffX + "px";
      box.style.top = ev.clientY - diffY + "px";
    }
    evOnce(doc, "mouseup", function(ev) {
      follow(ev); // Last chance to position
      doc[remEv]("mousemove", follow, false);
    });
    doc[addEv]("mousemove", follow, false);
  }
  
  function evBye(ev) {
    evStop(ev);
    // Cleanup
    window[remEv]("message", gotMessage, false);
    if (insertEvent) {
      doc[remEv]("dblclick", insertPassword, true);
      insertedClear();
    }
    if (child) child.close();
    doc.body.removeChild(box);
  }
  
  function insertPassword(ev) {
    var t = ev.target, prevCss;
    if (t.nodeName.toLowerCase() === "input" && t.type === "password") {
      if (!insertCheck(t)) {
        prevCss = t.style.cssText;
        merge(t.style, {backgroundColor: pwColor});
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
    while((obj = insertList.pop())) {
      obj.elem.style.cssText = obj.prevCss;
    }
  }
  
  function gotMessage(ev) {
    debug("gotev", ev, homeDomain);
    
    if (ev.origin === homeDomain) {
      if (ev.data === "hello") { // handshake
        ev.source.postMessage("world", ev.origin);
        debug("Handshake done, waiting for password");
        childRef = ev.source;
        return;
      }
      
      var obj = JSON.parse(ev.data);
      
      if (obj.hasOwnProperty("password")) {
        currentPassword = obj["password"];
        debug("Got password", currentPassword);
        box.style.backgroundColor = pwColor;
        
        if (!insertEvent) {
          doc[addEv]("dblclick", insertPassword, true);
          insertEvent = true;
        } else {
          insertedClear();
        }
      } else {
        debug('why ??? (bug)', obj);
      }
    }
  }
})(this);