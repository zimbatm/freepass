var $ = require('jquery').jQuery,
  fp = require('freepass'),
  hashmask = require('jquery/hashmask').hashmask,
  window = require('browser').window,
  document = window.document,
  hasPostMessage = false,
  bookmarkletVersion = 1,
  parent, parent_origin;

$(function() {
  var form = $("form#freepass"),
    masterpw = $("#masterpw"),
    domain = $("#domain"),
    $debug = $("#debug"),
    domainMask = $("#domain-mask"),
    subdomain = $("#subdomain"),
    subdomainLabel = $("label[for=subdomain]"),
    result = $("#result");
  
  // Detect if framed, big warning
  if (isFramed()) {
    $(document.body).addClass("frame-alert");
  }

  // Test for postMessage API
  (function() {
    function gotMessage(ev) {
      if (ev.data === "test" && ev.source === window) {
        hasPostMessage = true;
        window.removeEventListener("message", gotMessage, false);
        debug("postMessage: supported");
      }
    }
  
    try {
      //if (!window.addEventListener) return;
      window.addEventListener("message", gotMessage, false);
      window.postMessage("test", "*");
    } catch(err) {
      debug(err);
    }
  })();

  // Apply hashmask plugin
  hashmask(masterpw);
  masterpw.focus();

  // Detect if openend by client (window.open())
  if (window.opener) {
  
    //debug(window.opener.location.href); // Not allowed
  
    // Handshake to say it is loaded
    try {
      window.addEventListener("message", listenForParent, false);
      // TO: whomever called me
      window.opener.postMessage("hello", "*");
      debug("called from bookmarklet, notifying parent");
    } catch(err) {
      debug("Browser doesn't support the postMessage API");
    }
  }

  // Use referrer if available
  if (document.referrer && document.referrer.length > 0) {
    debug("Got url from referrer: " + document.referrer);
    setDomain(document.referrer);
  }

  form.submit(function (ev) {
    ev.stopPropagation();
    try {
      updateDomain();
      makePassword();
    } catch(err) { debug(err); }
    return false;
  });

  domain.focus(function () {
    showMask(false);
    domain.val($.data(domain, "domain"));
  });

  domain.blur(function () {
    if (filterSubdomain()) {
      showMask(true);
    }
  });

  domainMask.click(function (ev) {
    // FIXME: we should know where to place the carret
    domain.focus();
  });

  // Adjust domain mask position
  domainMask.css({
    top: parseInt(domain.css('borderTopWidth'), 10),
    left: parseInt(domain.css('borderLeftWidth'), 10),
    height: domain.outerHeight() + 'px',
    lineHeight: domain.outerHeight() + 'px'
  });

  domain.change(function() {
    setDomain(domain.val());
  });
  subdomain.change(updateDomain);

  result.dblclick(function() { this.select(); });

  // Show git HEAD commit id on website
  /*$.get('.git/HEAD', function(data) {
    // Extract head ref
    var head = data.slice(5);
    $.get('.git/' + head, function(hashid) {
      // Truncate at 8 chars
      $("#hashid").text('(commit: ' + hashid.slice(0, 10) + ')');
    });
  });*/

  $("#standalone-button").click(function (ev) {
    ev.preventDefault();
    this.blur();
    switchMode("standalone");
  });

  $("#connected-button").click(function (ev) {
    ev.preventDefault();
    this.blur();
    if (parent) {
      switchMode("connected");
    } else if (hasPostMessage) {
      switchMode("connected-help");
      buildBookmarklet();
    } else {
      switchMode("connected-incompatible");
    }
  });

  /* Utility functions */

  function updateDomain() {
    var _val = $.data(domain, "domain");
    domain.blur();

    domainMask.find(".prefix").text("");
    domainMask.find(".main").text("");
    domainMask.find(".postfix").text("");

    if (filterSubdomain()) {
      var _split = fp.extractDomain(_val, true);

      domainMask.find(".prefix").text(_split[0]);
      domainMask.find(".main").text(_split[1]);
      domainMask.find(".postfix").text(_split[2]);

      domain.val(_split[1]);

      showMask(true);
    } else {
      domain.val(_val);
      showMask(false);
    }
  }

  function showMask(yes) {
    if (yes) {
      domainMask.show();
      domain.css("color", "#fff");
    } else {
      domainMask.hide();
      domain.css("color", "");
    }
  }

  function setDomain(value) {
    $.data(domain, "domain", value);
    updateDomain();
  }

  function filterSubdomain() {
    var val = $.data(domain, "domain");
    return subdomain.attr("checked") && val && val !== "";
  }

  function listenForParent(ev) {
    // Once
    if (!parent) {
      var known = false, proposeUpdate = false;
      try {
        if (ev.data === "hello") {
          known = true;
          proposeUpdate = true;
          throw "next"
        }

        var msg = JSON.parse(ev.data);
        if (msg.version) {
          known = true;
          proposeUpdate = (msg.version < bookmarkletVersion);
        }
      } catch(err) { }

      if (!known) return;
      if (proposeUpdate) proposeBookmarkletUpdate();

      debug("Got url from parent window: " + ev.origin);
      setDomain(ev.origin);
      parent = ev.source;
      parent_origin = ev.origin;

      switchMode("connected");
    }
  }

  function proposeBookmarkletUpdate () {
    debug("Please update your bookmarklet");
    buildBookmarklet();
    $("#update-bookmarklet").show();
  }

  function makePassword() {
    var d = domain.val(),
      pw = fp.encode(masterpw.val(), d);

    if (parent) { // Framed
      parent.postMessage(JSON.stringify({password: pw}), parent_origin);
    }

    if (shouldClose()) {
      window.close();
    } else {
      if (parent) parent.focus();
      result.val(pw);
    }
  }

  function switchMode(newMode) {
    var $c = $("#content");
    $c.removeClass("standalone-mode connected-mode connected-help-mode connected-incompatible-mode");
    $c.addClass(newMode + "-mode");
  }

  function shouldClose() {
    var $c = $("#content");
    return $("#content").hasClass("connected-mode");
  }

  function debug() {
    for (var i=0; i<arguments.length; i++) {
      $debug.append("<div>" + arguments[i] + "</div>");
    }
  }

  function isFramed() {
    // or: top !== self
    return (window !== window.parent);
  }

  // Build bookmarklet
  // TODO: if it fails, lookup in the page for a <script type="text/bookmarklet">
  function buildBookmarklet() {
    var l = window.location,
      domain = l.protocol + '//' + l.hostname,
      url = domain + l.pathname,
      $bookmarklet = $(".bookmarklet");

    debug("Building bookmarklet for:", url);

    $bookmarklet.text("Building...");

    $.get('bookmarklet.min.js', function(data) {
      var src = data;

      src = src.replace(/\${homeUrl}/g, url);
      src = src.replace(/\${homeDomain}/g, domain);
      src = src.replace(/\${version}/g, bookmarkletVersion);

      $bookmarklet.attr("href", 'javascript:' + src);
      $bookmarklet.text("FreePass");
      $bookmarklet.click(function(ev) {
        ev.preventDefault();
      });

    }, 'text/plain');
  }

});
