var sha1 = require('sha1').hexdigest,
  $ = require('jquery').jQuery,
  sparkline = require('jquery/sparklite').sparkline;

/**
 * HashMask - a new approach to password masking security
 *
 * REQUIRES:
 * jquery.sparkline.js
 * a one way hashing method, currently sha1, provided by jquery.sha1.js
 *
 * @author    Chris Dary <umbrae@gmail.com>
 * @copyright Copyright (c) 2009 {@link http://arc90.com Arc90 Inc.}
 * @license   http://www.opensource.org/licenses/bsd-license.php
**/

exports.hashmask = hashmask;
exports.defaults = {
  hashFunction:     sha1,
  useColorAsHint:   true,
  sparkInterval:    500,
  sparklineOptions: {
    width:          '3em',
    height:         '1em',
    lineColor:      '#69C',
    spotColor:      false,
    minSpotColor:   false,
    maxSpotColor:   false
  }
};

function hashmask(obj, settings) {
  /**
   * @var object Contains an associative array of all settings for hashmask.
  **/
  settings = $.extend({}, exports.defaults, settings);

  /**
   * Add hashmask hint to an input. The input must be of type password.
   *
   * @param selector string A jquery capable selector, as defined here: http://docs.jquery.com/Selectors
   * @return void
  **/
  return $(obj).each(function() {
    var $sparkline, sparkTimeout, i;
    var $this = $(this);
            
    if (!$this.is('input[type="password"]')) {
      throw new Error('HashMask may only be used on inputs of type password.');
    }

    $sparkline = $('<div id="' + this.id + '-jquery-hashmask-sparkline"></div>');
    $sparkline.css({
      position:    'relative',
      top:         '-1em',
      textAlign:   "right",
      width:       "100%",
      height:      "0"
    });
    $sparkline.click(function() { $this.focus(); });

    $sparkline.insertAfter($this);

    $this.keyup(function(e) {
      window.clearTimeout(sparkTimeout);

      var inputVal = $this.val();
      if (inputVal === "") {
        $sparkline.html("");
        return;
      }

      var inputHash      = settings.hashFunction($this.val()).substr(0,20);
      var inputHexArr    = inputHash.split('');
      var inputDecArr    = [];

      /* Convert our hex string array into decimal numbers for sparkline consumption */
      for (var i=0; i<inputHexArr.length; i++) {
        inputDecArr.push(parseInt(inputHexArr[i], 16));
      }

      var fillColor;
      if (settings.useColorAsHint) {
        fillColor = '#' + inputHash.substr(0,6);
      } else {
        fillColor = settings.sparklineOptions.fillColor
      }
                
      sparkTimeout = window.setTimeout(function() {
        sparkline($sparkline, inputDecArr, $.extend( settings.sparklineOptions, {
          'height': '1em',
          'width': '3em',
          'float': "right",
          'fillColor': fillColor
        }));
      }, settings.sparkInterval);

    });

  });
}
