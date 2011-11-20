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
    masterpw = $("#freepass .masterpw"),
    domain = $("#freepass .domain"),
    $debug = $("#debug"),
    domainMask = $("#freepass .domain-mask"),
    subdomain = $("#freepass .subdomain"),
    subdomainLabel = $("label[for=subdomain]"),
    result = $("#freepass .result");
  
  // Detect if framed
  if (isFramed()) {
    // TODO: show something ?
    $("#bookmarklet").hide();
    $("#title").hide();
    $("p").hide();
    $("#debug").hide();
  }

  $("button.info").click(function(e) {
    e.stopPropagation();
    form.addClass("flip");
    return false;
  });
  $("#freepass .back").click(function(e) {
    e.stopPropagation();
    form.removeClass("flip");
    return false;
  });
  
  // Percent design
  $(window).resize(adaptFontSize);
  adaptFontSize();
  function adaptFontSize() {
    $("body").css("font-size", $("body").width() / 20);
  }
  
  // Generate bookmarklet
  var el = document.getElementById("bookmarklet");
  el.href = el.href.replace('${loc}', document.location);
  $(el).click(function(e) {
    e.stopPropagation();
    return false;
  });

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
      if (!masterpw.val()) {
        result.addClass("missing");
        result.val("master password missing");
      } else if (!domain.val()) {
        result.addClass("missing");
        result.val("domain missing");
      } else {
        result.removeClass("missing");
        makePassword();
      }
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

  domain.change(function() {
    setDomain(domain.val());
  });
  subdomain.change(updateDomain);

  result.click(function() { this.select(); });

  function updateDomainPos() {
    // Adjust domain mask position
    domainMask.css({
      top: parseInt(domain.css('borderTopWidth'), 10),
      left: parseInt(domain.css('borderLeftWidth'), 10),
      height: domain.outerHeight() + 'px',
      lineHeight: domain.outerHeight() + 'px'
    });
  }
  
  $(window).resize(updateDomainPos);
  
  // Show git HEAD commit id on website
  /*$.get('.git/HEAD', function(data) {
    // Extract head ref
    var head = data.slice(5);
    $.get('.git/' + head, function(hashid) {
      // Truncate at 8 chars
      $("#hashid").text('(commit: ' + hashid.slice(0, 10) + ')');
    });
  });*/

  /* Utility functions */

  function updateDomain() {
    updateDomainPos();
    
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
      domain.css("color", "transparent");
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

      debug("Got url from parent window: " + ev.origin);
      setDomain(ev.origin);
      parent = ev.source;
      parent_origin = ev.origin;

      switchMode("connected");
    }
  }

  function makePassword() {
    var d = domain.val(),
      pw = fp.encode(masterpw.val(), d);

    if (parent) { // Framed
      parent.postMessage(JSON.stringify({password: pw}), parent_origin);
    }

    if (parent) parent.focus();
    result.val(pw);
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
});
