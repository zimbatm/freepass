var $ = require('jquery').jQuery,
  pending = [];

/**
* Original code by (c) Splunk, Inc (New BSD Licence)
* Contact: Gareth Watts (gareth@splunk.com)
* http://omnipotent.net/jquery.sparkline/
*
* This is a lite version that only provides the line drawing functions for hashmask. 
*/

exports.sparkline = sparkline;
exports.simpledraw = simpledraw;
exports.defaults = {
    lineColor : '#00f',
    fillColor : '#cdf',
    defaultPixelsPerValue : 3,
    width : 'auto',
    height : 'auto',
    composite : false
}

// Provide a cross-browser interface to a few simple drawing primitives
function simpledraw(obj, width, height, use_existing) {
  if (use_existing && (obj.vcanvas || obj[0].vcanvas)) return (obj.vcanvas || obj[0].vcanvas);
  if (width==undefined) width=$(obj).innerWidth();
  if (height==undefined) height=$(obj).innerHeight();
  if ($.browser.hasCanvas) {
    return new vcanvas_canvas(width, height, obj);
  } else if ($.browser.msie) {
    return new vcanvas_vml(width, height, obj);
  } else {
    return false;
  }
};

function sparkline(obj, uservalues, options) {
  return $(obj).sparkline(uservalues, options);
}

$.fn.sparkline = function (uservalues, options) {
    var options = $.extend({}, exports.defaults, options ? options : {});
    
    return this.each(function() {
        var render = function() {
            var values = (uservalues=='html' || uservalues==undefined) ? $(this).text().split(',') : uservalues;

            var width = options.width=='auto' ? values.length*options.defaultPixelsPerValue : options.width;
            if (options.height == 'auto') {
                if (!options.composite || !this.vcanvas) {
                    // must be a better way to get the line height
                    var tmp = document.createElement('span');
                    tmp.innerHTML = 'a';
                    $(this).html(tmp);
                    height = $(tmp).innerHeight();
                    $(tmp).remove();
                }
            } else {
                height = options.height;
            }

            line.call(this, values, options, width, height);
        }
        // jQuery 1.3.0 completely changed the meaning of :hidden :-/
        if ($(this).html() && $(this).is(':hidden')) {
            pending.push([this, render]);
        } else {
            render.call(this);
        }
    });
};

function line(values, options, width, height) {
    var options = $.extend({
        spotColor : '#f80',
        spotRadius : 1.5,
        minSpotColor : '#f80',
        maxSpotColor : '#f80',
        normalRangeMin : undefined,
        normalRangeMax : undefined,
        normalRangeColor : '#ccc',
        chartRangeMin : undefined,
        chartRangeMax : undefined
    }, options ? options : {});

    var xvalues = [], yvalues = [];
    for (i=0; i<values.length; i++) {
        var isstr = typeof(values[i])=='string';
        var isarray = typeof(values[i])=='object' && values[i] instanceof Array;
        var sp = isstr && values[i].split(':');
        if (isstr && sp.length == 2) { // x:y
            xvalues.push(Number(sp[0]));
            yvalues.push(Number(sp[1]));
        } else if (isarray) {
            xvalues.push(values[i][0]);
            yvalues.push(values[i][1]);
        } else {
            xvalues.push(i);
            yvalues.push(Number(values[i]));
        }
    }
    if (options.xvalues) {
        xvalues = options.xvalues;
    }

    var maxy = Math.max.apply(Math, yvalues);
    var maxyval = maxy;
    var miny = Math.min.apply(Math, yvalues);
    var minyval = miny;

    var maxx = Math.max.apply(Math, xvalues);
    var maxxval = maxx;
    var minx = Math.min.apply(Math, xvalues);
    var minxval = minx;

    if (options.normalRangeMin!=undefined) {
        if (options.normalRangeMin<miny)
            miny = options.normalRangeMin;
        if (options.normalRangeMax>maxy)
            maxy = options.normalRangeMax;
    }
    if (options.chartRangeMin!=undefined && options.chartRangeMin<miny) {
        miny = options.chartRangeMin;
    }
    if (options.chartRangeMax!=undefined && options.chartRangeMax>maxy) {
        maxy = options.chartRangeMax;
    }
    var rangex = maxx-minx == 0 ? 1 : maxx-minx;
    var rangey = maxy-miny == 0 ? 1 : maxy-miny;
    var vl = yvalues.length-1;

    if (vl<1) {
        this.innerHTML = '';
        return;
    }

    var target = simpledraw(this, width, height, options.composite);
    if (target) {
        var canvas_width = target.pixel_width;
        var canvas_height = target.pixel_height;
        var canvas_top = 0;
        var canvas_left = 0;

        if (options.spotRadius && (canvas_width < (options.spotRadius*4) || canvas_height < (options.spotRadius*4))) {
            options.spotRadius = 0;
        }
        if (options.spotRadius) {
            // adjust the canvas size as required so that spots will fit
            if (options.minSpotColor || (options.spotColor && yvalues[vl]==miny)) 
                canvas_height -= Math.ceil(options.spotRadius);
            if (options.maxSpotColor || (options.spotColor && yvalues[vl]==maxy)) {
                canvas_height -= Math.ceil(options.spotRadius);
                canvas_top += Math.ceil(options.spotRadius);
            }
            if (options.minSpotColor || options.maxSpotColor && (yvalues[0]==miny || yvalues[0]==maxy)) {
                canvas_left += Math.ceil(options.spotRadius);
                canvas_width -= Math.ceil(options.spotRadius);
            }
            if (options.spotColor || (options.minSpotColor || options.maxSpotColor && (yvalues[vl]==miny||yvalues[vl]==maxy)))
                canvas_width -= Math.ceil(options.spotRadius);
        }


        canvas_height--;
        if (options.normalRangeMin!=undefined) {
            var ytop = canvas_top+Math.round(canvas_height-(canvas_height*((options.normalRangeMax-miny)/rangey)));
            var height = Math.round((canvas_height*(options.normalRangeMax-options.normalRangeMin))/rangey);
            target.drawRect(canvas_left, ytop, canvas_width, height, undefined, options.normalRangeColor);
        }

        var path = [ [canvas_left, canvas_top+canvas_height] ];
        for(var i=0; i<yvalues.length; i++) {
            var x=xvalues[i], y=yvalues[i];
            path.push([canvas_left+Math.round((x-minx)*(canvas_width/rangex)), canvas_top+Math.round(canvas_height-(canvas_height*((y-miny)/rangey)))]);
        }
        if (options.fillColor) {
            path.push([canvas_left+canvas_width, canvas_top+canvas_height-1]);
            target.drawShape(path, undefined, options.fillColor);
            path.pop();
        }
        path[0] = [ canvas_left, canvas_top+Math.round(canvas_height-(canvas_height*((yvalues[0]-miny)/rangey))) ];
        target.drawShape(path, options.lineColor);
        if (options.spotRadius && options.spotColor) {
            target.drawCircle(canvas_left+canvas_width,  canvas_top+Math.round(canvas_height-(canvas_height*((yvalues[vl]-miny)/rangey))), options.spotRadius, undefined, options.spotColor);
        }
        if (maxy!=minyval) {
            if (options.spotRadius && options.minSpotColor) {
                var x = xvalues[aryIndexOf.call(yvalues, minyval)];
                target.drawCircle(canvas_left+Math.round((x-minx)*(canvas_width/rangex)),  canvas_top+Math.round(canvas_height-(canvas_height*((minyval-miny)/rangey))), options.spotRadius, undefined, options.minSpotColor);
            }
            if (options.spotRadius && options.maxSpotColor) {
                var x = xvalues[aryIndexOf.call(yvalues, maxyval)];
                target.drawCircle(canvas_left+Math.round((x-minx)*(canvas_width/rangex)),  canvas_top+Math.round(canvas_height-(canvas_height*((maxyval-miny)/rangey))), options.spotRadius, undefined, options.maxSpotColor);
            }
        }
    } else {
        // Remove the tag contents if sparklines aren't supported
        this.innerHTML = '';
    }
};

// IE doesn't provide an indexOf method for arrays :-(
var aryIndexOf = Array.prototype.indexOf || function(entry) {
  for(var i=0; i<this.length; i++) {
    if (this[i] == entry) return i;
  }
  return -1;
}

// Setup a very simple "virtual canvas" to make drawing the few shapes we need easier
// This is accessible as $(foo).simpledraw()

if ($.browser.msie && !document.namespaces['v']) {
    document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
}

if ($.browser.hasCanvas == undefined) {
    var t = document.createElement('canvas');
    $.browser.hasCanvas = t.getContext!=undefined;
}

var vcanvas_base = function(width, height, target) {
};

vcanvas_base.prototype = {
    init : function(width, height, target) {
        this.width = width;
        this.height = height;
        this.target = target;
        if (target[0]) target=target[0];
        target.vcanvas = this;
    },

    drawShape : function(path, lineColor, fillColor) {
        alert('drawShape not implemented');
    },

    drawLine : function(x1, y1, x2, y2, lineColor) {
        return this.drawShape([ [x1,y1], [x2,y2] ], lineColor);
    },

    drawCircle : function(x, y, radius, lineColor, fillColor) {
        alert('drawCircle not implemented');
    },

    drawPieSlice : function(x, y, radius, startAngle, endAngle, lineColor, fillColor) {
        alert('drawPieSlice not implemented');
    },

    drawRect : function(x, y, width, height, lineColor, fillColor) {
        alert('drawRect not implemented');
    },

    getElement : function() {
        return this.canvas;
    },

    _insert : function(el, target) {
        $(target).html(el);
    }
};

var vcanvas_canvas = function(width, height, target) {
    return this.init(width, height, target);
};

vcanvas_canvas.prototype = $.extend(new vcanvas_base, {
    _super : vcanvas_base.prototype,

    init : function(width, height, target) {
        this._super.init(width, height, target);
        this.canvas = document.createElement('canvas');
        if (target[0]) target=target[0];
        target.vcanvas = this;
        $(this.canvas).css({ display:'inline-block', width:width, height:height, verticalAlign:'top' });
        this._insert(this.canvas, target);
        this.pixel_height = $(this.canvas).height();
        this.pixel_width = $(this.canvas).width();
        this.canvas.width = this.pixel_width;
        this.canvas.height = this.pixel_height;
        $(this.canvas).css({width: this.pixel_width, height: this.pixel_height});
    },

    _getContext : function(lineColor, fillColor) {
        var context = this.canvas.getContext('2d');
        if (lineColor != undefined)
            context.strokeStyle = lineColor;
        context.lineWidth = 1;
        if (fillColor != undefined)
            context.fillStyle = fillColor;
        return context;
    },

    drawShape : function(path, lineColor, fillColor) {
        var context = this._getContext(lineColor, fillColor);
        context.beginPath();
        context.moveTo(path[0][0]+0.5, path[0][1]+0.5);
        for(var i=1; i<path.length; i++) {
            context.lineTo(path[i][0]+0.5, path[i][1]+0.5); // the 0.5 offset gives us crisp pixel-width lines
        }
        if (lineColor != undefined) {
            context.stroke();
        }
        if (fillColor != undefined) {
            context.fill();
        }
    },

    drawCircle : function(x, y, radius, lineColor, fillColor) {
        var context = this._getContext(lineColor, fillColor);
        context.beginPath();
        context.arc(x, y, radius, 0, 2*Math.PI, false);
        if (lineColor != undefined) {
            context.stroke();
        }
        if (fillColor != undefined) {
            context.fill();
        }
    }, 

    drawPieSlice : function(x, y, radius, startAngle, endAngle, lineColor, fillColor) {
        var context = this._getContext(lineColor, fillColor);
        context.beginPath();
        context.moveTo(x, y);
        context.arc(x, y, radius, startAngle, endAngle, false);
        context.lineTo(x, y);
        context.closePath();
        if (lineColor != undefined) {
            context.stroke();
        }
        if (fillColor) {
            context.fill();
        }
    },

    drawRect : function(x, y, width, height, lineColor, fillColor) {
        return this.drawShape([ [x,y], [x+width, y], [x+width, y+height], [x, y+height], [x, y] ], lineColor, fillColor);
    }
    
});

var vcanvas_vml = function(width, height, target) {
    return this.init(width, height, target);
};

vcanvas_vml.prototype = $.extend(new vcanvas_base, {
    _super : vcanvas_base.prototype,

    init : function(width, height, target) {
        this._super.init(width, height, target);
        if (target[0]) target=target[0];
        target.vcanvas = this;
        this.canvas = document.createElement('span');
        $(this.canvas).css({ display:'inline-block', position: 'relative', overflow:'hidden', width:width, height:height, margin:'0px', padding:'0px', verticalAlign: 'top'});
        this._insert(this.canvas, target);
        this.pixel_height = $(this.canvas).height();
        this.pixel_width = $(this.canvas).width();
        this.canvas.width = this.pixel_width;
        this.canvas.height = this.pixel_height;;
        var groupel = '<v:group coordorigin="0 0" coordsize="'+this.pixel_width+' '+this.pixel_height+'"'
                +' style="position:absolute;top:0;left:0;width:'+this.pixel_width+'px;height='+this.pixel_height+'px;"></v:group>';
        this.canvas.insertAdjacentHTML('beforeEnd', groupel);
        this.group = $(this.canvas).children()[0];
    },

    drawShape : function(path, lineColor, fillColor) {
        var vpath = [];
        for(var i=0; i<path.length; i++) {
            vpath[i] = ''+(path[i][0])+','+(path[i][1]);
        }
        var initial = vpath.splice(0,1);
        var stroke = lineColor == undefined ? ' stroked="false" ' : ' strokeWeight="1" strokeColor="'+lineColor+'" ';
        var fill = fillColor == undefined ? ' filled="false"' : ' fillColor="'+fillColor+'" filled="true" ';
        var closed = vpath[0] == vpath[vpath.length-1] ? 'x ' : '';
        var vel = '<v:shape coordorigin="0 0" coordsize="'+this.pixel_width+' '+this.pixel_height+'" '
            + stroke
            + fill
            +' style="position:absolute;left:0px;top:0px;height:'+this.pixel_height+'px;width:'+this.pixel_width+'px;padding:0px;margin:0px;" '
            +' path="m '+initial+' l '+vpath.join(', ')+' '+closed+'e">'
            +' </v:shape>';
         this.group.insertAdjacentHTML('beforeEnd', vel);
    },

    drawCircle : function(x, y, radius, lineColor, fillColor) {
        x -= radius+1;
        y -= radius+1;
        var stroke = lineColor == undefined ? ' stroked="false" ' : ' strokeWeight="1" strokeColor="'+lineColor+'" ';
        var fill = fillColor == undefined ? ' filled="false"' : ' fillColor="'+fillColor+'" filled="true" ';
        var vel = '<v:oval '
            + stroke
            + fill
            +' style="position:absolute;top:'+y+'px; left:'+x+'px; width:'+(radius*2)+'px; height:'+(radius*2)+'px"></v:oval>';
        this.group.insertAdjacentHTML('beforeEnd', vel);
        
    },
    
    drawPieSlice : function(x, y, radius, startAngle, endAngle, lineColor, fillColor) {
        if (startAngle == endAngle) {
            return;  // VML seems to have problem when start angle equals end angle.
        }
        if ((endAngle - startAngle) == (2*Math.PI)) {
            startAngle = 0.0;  // VML seems to have a problem when drawing a full circle that doesn't start 0
            endAngle = (2*Math.PI);
        }

        var startx = x + Math.round(Math.cos(startAngle) * radius);
        var starty = y + Math.round(Math.sin(startAngle) * radius);
        var endx = x + Math.round(Math.cos(endAngle) * radius);
        var endy = y + Math.round(Math.sin(endAngle) * radius);

        var vpath = [  x-radius, y-radius, x+radius, y+radius, startx, starty, endx, endy ]; 
        var stroke = lineColor == undefined ? ' stroked="false" ' : ' strokeWeight="1" strokeColor="'+lineColor+'" ';
        var fill = fillColor == undefined ? ' filled="false"' : ' fillColor="'+fillColor+'" filled="true" ';
        var vel = '<v:shape coordorigin="0 0" coordsize="'+this.pixel_width+' '+this.pixel_height+'" '
            + stroke
            + fill
            +' style="position:absolute;left:0px;top:0px;height:'+this.pixel_height+'px;width:'+this.pixel_width+'px;padding:0px;margin:0px;" '
            +' path="m '+x+','+y+' wa '+vpath.join(', ')+' x e">'
            +' </v:shape>';
         this.group.insertAdjacentHTML('beforeEnd', vel);
    },

    drawRect : function(x, y, width, height, lineColor, fillColor) {
        return this.drawShape( [ [x, y], [x, y+height], [x+width, y+height], [x+width, y], [x, y] ], lineColor, fillColor);
    }
});

