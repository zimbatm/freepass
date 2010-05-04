// TODO: look for password fields in iframes
// TODO: give better names to functions, make it more readable
// NOTE: we're only using W3C methods and old/insecure browser will fail but who cares ?
(function(window) {
  var doc = window.document,
    homeUrl = "${homeUrl}",
    homeDomain = "${homeDomain}",
    bookmarkletVersion = "${version}",
    fid = "freepass",
    pwColor = "#ddffdd",
    insertList = [], insertEvent = false,
    passwd, child, childRef, box, msg, bye, currentPassword;
  
  // Don't run twice
  if (doc.getElementById(fid)) return;
  
  // Keep currently focused password field
  // NOTE: doesn't seem to work on FF
  if (doc.activeElement.type && doc.activeElement.type.toLowerCase() == "password") {
    passwd = doc.activeElement;
  }
  
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
  box.addEventListener("mousedown", evDrag, false);
  
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
  bye.addEventListener("click", evBye, false);
  
  box.appendChild(bye);
  box.appendChild(msg);
  doc.body.appendChild(box);

  // Listen for eventual child messages
  window.addEventListener("message", gotMessage, false);

  // Open freepass window (if possible)
  openChild();
  
  /*
  *  Functions
  */

  function openChild() {
    if (childRef && (!child || !child.closed)) return;
    say("Waiting for handshake");
    childRef = null;
    child = window.open(homeUrl);
  }
  
  function say(txt) {
    if (typeof window.console !== "undefined") {
      window.console.log(txt);
    }
    msg.innerHTML = txt;
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
      obj.removeEventListener(type, wrap, false);
    }
    obj.addEventListener(type, wrap, false);
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
      doc.removeEventListener("mousemove", follow, false);
    });
    doc.addEventListener("mousemove", follow, false);
  }
  
  function evBye(ev) {
    evStop(ev);
    // Cleanup
    window.removeEventListener("message", gotMessage, false);
    if (insertEvent) {
      doc.removeEventListener("dblclick", insertPasswordEv, true);
      insertedClear();
    }
    if (child) child.close();
    doc.body.removeChild(box);
  }
  
  function insertPasswordEv(ev) {
    insertPassword(ev.target);
  }

  function insertPassword(elem) {
    var prevCss;
    if (elem.nodeName.toLowerCase() === "input" && elem.type === "password") {
      if (!insertCheck(t)) {
        prevCss = elem.style.cssText;
        merge(elem.style, {backgroundColor: pwColor});
        elem.value = currentPassword;
        insertList.push({elem: elem, prevCss: prevCss});
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
    if (ev.origin === homeDomain) {
      if (ev.data === "hello") { // handshake
        ev.source.postMessage('{"version":'+version+'}', ev.origin);
        childRef = ev.source;
        say("Waiting for password");
        return;
      }
      
      var obj = JSON.parse(ev.data);
      
      if (obj.hasOwnProperty("password")) {
        currentPassword = obj["password"];
        box.style.backgroundColor = pwColor;
        
        if (!insertEvent) {
          doc.addEventListener("dblclick", insertPasswordEv, true);
          insertEvent = true;
        } else {
          insertedClear();
        }
        
        if (passwd) {
          insertPassword(passwd);
        }
        
        say("Got password, double-click on field to insert");
      } else {
        throw new Error("why ??? (bug)", obj);
      }
    } else {
      say(ev.origin + "!==" + homeDomain);
    }
  }
})(this);
