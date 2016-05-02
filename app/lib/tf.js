/******************** Dependent on Farbtastic Color Picker ************************
 * Farbtastic Color Picker 1.2
 * © 2008 Steven Wittens
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 ************************************************************************************/

jQuery.fn.farbtastic = function (callback) {
  $.farbtastic(this, callback);
  return this;
};

jQuery.farbtastic = function (container, callback) {
  var container = $(container).get(0);
  return container.farbtastic || (container.farbtastic = new jQuery._farbtastic(container, callback));
}

jQuery._farbtastic = function (container, callback) {
  // Store farbtastic object
  var fb = this;

  // Insert markup
  $(container).html('<div class="farbtastic"><div class="color"></div><div class="wheel"></div><div class="overlay"></div><div class="h-marker marker"></div><div class="sl-marker marker"></div></div>');
  var e = $('.farbtastic', container);
  fb.wheel = $('.wheel', container).get(0);
  // Dimensions
  fb.radius = 56;//84;
  fb.square = 66;//100;
  fb.width = 128;//194

  // Fix background PNGs in IE6
  if (navigator.appVersion.match(/MSIE [0-6]\./)) {
    $('*', e).each(function () {
      if (this.currentStyle.backgroundImage != 'none') {
        var image = this.currentStyle.backgroundImage;
        image = this.currentStyle.backgroundImage.substring(5, image.length - 2);
        $(this).css({
          'backgroundImage': 'none',
          'filter': "progid:DXImageTransform.Microsoft.AlphaImageLoader(enabled=true, sizingMethod=crop, src='" + image + "')"
        });
      }
    });
  }

  /**
   * Link to the given element(s) or callback.
   */
  fb.linkTo = function (callback) {
    // Unbind previous nodes
    if (typeof fb.callback == 'object') {
      $(fb.callback).unbind('keyup', fb.updateValue);
    }

    // Reset color
    fb.color = null;

    // Bind callback or elements
    if (typeof callback == 'function') {
      fb.callback = callback;
    }
    else if (typeof callback == 'object' || typeof callback == 'string') {
      fb.callback = $(callback);
      fb.callback.bind('keyup', fb.updateValue);
      if (fb.callback.get(0).value) {
        fb.setColor(fb.callback.get(0).value);
      }
    }
    return this;
  }
  fb.updateValue = function (event) {
    if (this.value && this.value != fb.color) {
      fb.setColor(this.value);
    }
  }

  /** * Change color with HTML syntax #123456
   */
  fb.setColor = function (color) {
    var unpack = fb.unpack(color);
    if (fb.color != color && unpack) {
      fb.color = color;
      fb.rgb = unpack;
      fb.hsl = fb.RGBToHSL(fb.rgb);
      fb.updateDisplay();
    }
    return this;
  }

  /**
   * Change color with HSL triplet [0..1, 0..1, 0..1]
   */
  fb.setHSL = function (hsl) {
    fb.hsl = hsl;
    fb.rgb = fb.HSLToRGB(hsl);
    fb.color = fb.pack(fb.rgb);
    fb.updateDisplay();
    return this;
  }

  /////////////////////////////////////////////////////

  /**
   * Retrieve the coordinates of the given event relative to the center
   * of the widget.
   */
  fb.widgetCoords = function (event) {
    var x, y;
    var el = event.target || event.srcElement;
    var reference = fb.wheel;

    if (typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };

      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Look for the coordinates starting from the wheel widget.
      var e = reference;
      var offset = { x: 0, y: 0 }
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }

      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = fb.absolutePosition(reference);
      x = (event.pageX || 0*(event.clientX + $('html').get(0).scrollLeft)) - pos.x;
      y = (event.pageY || 0*(event.clientY + $('html').get(0).scrollTop)) - pos.y;
    }
    // Subtract distance to middle
    return { x: x - fb.width / 2, y: y - fb.width / 2 };
  }

  /**
   * Mousedown handler
   */
  fb.mousedown = function (event) {
    // Capture mouse
    if (!document.dragging) {
      $(document).bind('mousemove', fb.mousemove).bind('mouseup', fb.mouseup);
      document.dragging = true;
    }

    // Check which area is being dragged
    var pos = fb.widgetCoords(event);
    fb.circleDrag = Math.max(Math.abs(pos.x), Math.abs(pos.y)) * 2 > fb.square;

    // Process
    fb.mousemove(event);
    return false;
  }

  /**
   * Mousemove handler
   */
  fb.mousemove = function (event) {
    // Get coordinates relative to color picker center
    var pos = fb.widgetCoords(event);

    // Set new HSL parameters
    if (fb.circleDrag) {
      var hue = Math.atan2(pos.x, -pos.y) / 6.28;
      if (hue < 0) hue += 1;
      fb.setHSL([hue, fb.hsl[1], fb.hsl[2]]);
    }
    else {
      var sat = Math.max(0, Math.min(1, -(pos.x / fb.square) + .5));
      var lum = Math.max(0, Math.min(1, -(pos.y / fb.square) + .5));
      fb.setHSL([fb.hsl[0], sat, lum]);
    }
    return false;
  }

  /**
   * Mouseup handler
   */
  fb.mouseup = function () {
    // Uncapture mouse
    $(document).unbind('mousemove', fb.mousemove);
    $(document).unbind('mouseup', fb.mouseup);
    document.dragging = false;
  }

  /**
   * Update the markers and styles
   */
  fb.updateDisplay = function () {
    // Markers
    var angle = fb.hsl[0] * 6.28;
    $('.h-marker', e).css({
      left: Math.round(Math.sin(angle) * fb.radius + fb.width / 2) + 'px',
      top: Math.round(-Math.cos(angle) * fb.radius + fb.width / 2) + 'px'
    });

    $('.sl-marker', e).css({
      left: Math.round(fb.square * (.5 - fb.hsl[1]) + fb.width / 2) + 'px',
      top: Math.round(fb.square * (.5 - fb.hsl[2]) + fb.width / 2) + 'px'
    });

    // Saturation/Luminance gradient
    $('.color', e).css('backgroundColor', fb.pack(fb.HSLToRGB([fb.hsl[0], 1, 0.5])));

    // Linked elements or callback
    if (typeof fb.callback == 'object') {
      // Set background/foreground color
      $(fb.callback).css({
        backgroundColor: fb.color,
        color: fb.hsl[2] > 0.5 ? '#000' : '#fff'
      });

      // Change linked value
      $(fb.callback).each(function() {
        if (this.value && this.value != fb.color) {
          this.value = fb.color;
        }
      });
    }
    else if (typeof fb.callback == 'function') {
      fb.callback.call(fb, fb.color);
    }
  }

  /**
   * Get absolute position of element
   */
  fb.absolutePosition = function (el) {
    var r = { x: el.offsetLeft, y: el.offsetTop };
    // Resolve relative to offsetParent
    if (el.offsetParent) {
      var tmp = fb.absolutePosition(el.offsetParent);
      r.x += tmp.x;
      r.y += tmp.y;
    }
    return r;
  };

  /* Various color utility functions */
  fb.pack = function (rgb) {
    var r = Math.round(rgb[0] * 255);
    var g = Math.round(rgb[1] * 255);
    var b = Math.round(rgb[2] * 255);
    return '#' + (r < 16 ? '0' : '') + r.toString(16) +
           (g < 16 ? '0' : '') + g.toString(16) +
           (b < 16 ? '0' : '') + b.toString(16);
  }

  fb.unpack = function (color) {
    if (color.length == 7) {
      return [parseInt('0x' + color.substring(1, 3)) / 255,
        parseInt('0x' + color.substring(3, 5)) / 255,
        parseInt('0x' + color.substring(5, 7)) / 255];
    }
    else if (color.length == 4) {
      return [parseInt('0x' + color.substring(1, 2)) / 15,
        parseInt('0x' + color.substring(2, 3)) / 15,
        parseInt('0x' + color.substring(3, 4)) / 15];
    }
  }

  fb.HSLToRGB = function (hsl) {
    var m1, m2, r, g, b;
    var h = hsl[0], s = hsl[1], l = hsl[2];
    m2 = (l <= 0.5) ? l * (s + 1) : l + s - l*s;
    m1 = l * 2 - m2;
    return [this.hueToRGB(m1, m2, h+0.33333),
        this.hueToRGB(m1, m2, h),
        this.hueToRGB(m1, m2, h-0.33333)];
  }

  fb.hueToRGB = function (m1, m2, h) {
    h = (h < 0) ? h + 1 : ((h > 1) ? h - 1 : h);
    if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
    if (h * 2 < 1) return m2;
    if (h * 3 < 2) return m1 + (m2 - m1) * (0.66666 - h) * 6;
    return m1;
  }

  fb.RGBToHSL = function (rgb) {
    var min, max, delta, h, s, l;
    var r = rgb[0], g = rgb[1], b = rgb[2];
    min = Math.min(r, Math.min(g, b));
    max = Math.max(r, Math.max(g, b));
    delta = max - min;
    l = (min + max) / 2;
    s = 0;
    if (l > 0 && l < 1) {
      s = delta / (l < 0.5 ? (2 * l) : (2 - 2 * l));
    }
    h = 0;
    if (delta > 0) {
      if (max == r && max != g) h += (g - b) / delta;
      if (max == g && max != b) h += (2 + (b - r) / delta);
      if (max == b && max != r) h += (4 + (r - g) / delta);
      h /= 6;
    }
    return [h, s, l];
  }

  // Install mousedown handler (the others are set on the document on-demand)
  $('*', e).mousedown(fb.mousedown);

    // Init color
  fb.setColor('#000000');

  // Set linked elements/callback
  if (callback) {
    fb.linkTo(callback);
  }
}

/**
 * Transfer Function Widget 1.0
 * © 2015 Qingya Shu
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */

jQuery.fn.tfWidget = function(callback) {
  $.tfWidget(this, callback);
  return this;
}

jQuery.tfWidget = function(container, callback) {
  var container = $(container).get(0);
  return container.tfWidget || (container.tfWidget = new jQuery._tfWidget(container, callback));
}

jQuery._tfWidget = function(container, callback) {
  var tf = this;
  var str = '<div id="tf-container">'+
              '<div id="tf-widget"></div>'+
              '<div id="tf-picker-and-buttons">'+
                '<div id="tf-picker"></div>'+
                '<table id="tf-buttons">'+
                  '<tr>'+
                    '<td><button id="reset-button" class="tf-button">reset</button></td>'+
                    '<td><button id="apply-button" class="tf-button">apply</button></td>'+
                  '</tr>'+
                  '<tr>'+
                    '<td><button id="save-button" class="tf-button">save</button></td>'+
                    '<td><button id="load-button" class="tf-button">load</button></td>'+
                  '</tr>'+
                '</table>'+
              '</div>'+
            '</div>';
  $(container).html(str);

  // Callback function if change color in the picker
  function changeColorCallback(color) {
    var p = controlPoints[highlightedCPIndex];
    p.rgb = color;
    refreshGradient();
    refreshControlPointColor();
    callback.call(tf, controlPoints, controlPointsToArray());
  }

  // Bezier function
  function bezier(t, p0, p1, p2, p3) {
    var cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;
          
    var cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;
          
    var x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    var y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;
          
    return {x: x, y: y};
  };


  function drawBackgroundGrids() {
    // Draw background grids
    var d3svg = d3.select('#tf-widget svg');
    for (var i = 0; i < 10; i ++) {
      var h = tfHeight / 10 * i;
      d3svg.append('line')
           .attr('x1', 0)
           .attr('y1', h)
           .attr('x2', tfWidth)
           .attr('y2', h)
           .style('stroke', 'grey');
      var w = tfWidth / 10 * i;
      d3svg.append('line')
           .attr('x1', w)
           .attr('y1', 0)
           .attr('x2', w)
           .attr('y2', tfHeight)
           .style('stroke', 'grey');
      d3svg.append('line')
           .attr('x1', w)
           .attr('y1', tfHeight + colorBarGap)
           .attr('x2', w)
           .attr('y2', tfHeight + colorBarGap + colorBarHeight)
           .style('stroke', 'grey');
    }
  }

  function refreshGradient() {
    d3.select('#grad')
      .selectAll('stop')
      .attr('offset', function(d) {
        return d.index;
      })
      .attr('stop-color', function(d) {
        return d.rgb;
      })
      .attr('stop-opacity', function(d) {
        return 0.0 + d.alpha;
      });
    d3.select('#grad-noalpha')
      .selectAll('stop')
      .attr('offset', function(d) {
        return d.index;
      })
      .attr('stop-color', function(d) {
        return d.rgb;
      })
      .attr('stop-opacity', function(d) {
        return 1.0;
      });
  }

  function constructGradient() {
    d3.select('#tf-widget svg')
      .select('defs')
      .remove();
    d3.select('#tf-widget svg')
      .append('svg:defs')
      .append('svg:linearGradient')
      .attr('class', 'tf-gradient')
      .attr('id', 'grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data(controlPoints)
      .enter().append('stop')
      .attr('offset', function(d) {
        return d.index;
      })
      .attr('stop-color', function(d) {
        return d.rgb;
      })
      .attr('stop-opacity', function(d) {
        return 0.0 + d.alpha;
      });
    d3.select('#tf-widget svg')
      .select('defs')
      .append('svg:linearGradient')
      .attr('class', 'tf-gradient')
      .attr('id', 'grad-noalpha')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%')
      .selectAll('stop')
      .data(controlPoints)
      .enter().append('stop')
      .attr('offset', function(d) {
        return d.index;
      })
      .attr('stop-color', function(d) {
        return d.rgb;
      })
      .attr('stop-opacity', function(d) {
        return 1;
      });
  }

  function drawTFCurve() {
    if ($('.tf-curve').length == 0) {
      d3.select('#tf-widget svg')
         .append('path')
         .attr('class', 'tf-curve')
         .style('stroke', 'black')
         .style('fill', 'url(#grad)');
    }
    d3.select('.tf-curve')
      .attr('d', function() {
       var firstY = (1 - controlPoints[0].alpha) * tfHeight;
       var str = 'M0,' + firstY;
       for (var i = 0; i < controlPoints.length-1; i ++) {
         var point = controlPoints[i];
         var nextPoint = controlPoints[i+1];
         var middleX = (point.index + nextPoint.index) / 2 * tfWidth;
         var nextX = nextPoint.index * tfWidth;
         var thisY = (1-point.alpha) * tfHeight;
         var nextY = (1-nextPoint.alpha) * tfHeight;
         str += 'C' + middleX + ',' + thisY + ' '
                    + middleX + ',' + nextY + ' '
                    + nextX + ',' + nextY;
       }
       str += 'L' + tfWidth + ',' + tfHeight + ' ';
       str += 'L0,' + tfHeight + 'z';
       return str;
      })
  }

  function drawColorBars() {
    // Draw color bar
    var d3svg = d3.select('#tf-widget svg');
    var colorBar1 = d3svg.append('rect')
                        .attr('x', 0)
                        .attr('y', tfHeight + colorBarGap)
                        .attr('width', colorBarWidth)
                        .attr('height', colorBarHeight)
                        .style('stroke', 'black')
                        .style('fill', 'url(#grad)');

    var colorBar2 = d3svg.append('rect')
                        .attr('x', 0)
                        .attr('y', tfHeight + 2*colorBarGap + colorBarHeight)
                        .attr('width', colorBarWidth)
                        .attr('height', colorBarHeight)
                        .style('stroke', 'black')
                        .style('fill', 'url(#grad-noalpha)');
  }

  function appendControlPoints(x, y) {
    if (y > tfHeight) return;
    y = tfHeight - y;
    var insertIndex = 0;
    while (controlPoints[insertIndex].index * tfWidth < x) {
      insertIndex++;
    }
    var newPoint = new ControlPoint(x/tfWidth, y/tfHeight, controlPoints[highlightedCPIndex].rgb);
    controlPoints.splice(insertIndex, 0, newPoint);
    highlightedCPIndex = insertIndex;
    $('.control-point').attr('class', 'control-point');
    $('.control-point')[highlightedCPIndex].setAttribute('class', 'control-point highlighted');
    constructGradient();
    drawControlPoints();
    drawTFCurve();
  }

  function removeControlPoints(i) {
    if (i == 0 || i == controlPoints.length-1) return;
    controlPoints.splice(i, 1);
    constructGradient();
    drawControlPoints();
    drawTFCurve();
  }

  function refreshControlPointColor() {
    d3.select('#tf-widget svg')
      .selectAll('circle')
      .style('fill', function(d, i) {
        return controlPoints[i].rgb;
      });
  }

  // Iniliaze TF canvas
  function initializeTFCanvas() {
    var d3svg = d3.select('#tf-widget')
                .append('svg')
                .attr('id', 'tfSVG')
                .attr('width', svgWidth)
                .attr('height', svgHeight)
                .on('mousedown', function(e) {
                  var mousePos = d3.mouse(this);
                  switch (d3.event.which) {
                    case 1:
                      var tmpX = mousePos[0];
                      var tmpY = mousePos[1];
                      if (!isDrag) {
                        appendControlPoints(tmpX, tmpY);
                        deltaX = 0;
                        deltaY = 0;
                        tmpIndex = controlPoints[highlightedCPIndex].index;
                        tmpAlpha = controlPoints[highlightedCPIndex].alpha;
                        creatingNewPointPos.x = tmpX;
                        creatingNewPointPos.y = tmpY;
                        creatingNewPoint = true;
                      }
                      callback.call(tf, controlPoints, controlPointsToArray());
                      break;
                  }
                })
                .on('mouseover', function(e) {
                  if (creatingNewPoint) {
                    var mousePos = d3.mouse(this);
                    var tmpX = mousePos[0];
                    var tmpY = mousePos[1];
                    var dx = tmpX - creatingNewPointPos.x;
                    var dy = tmpY - creatingNewPointPos.y;
                    creatingNewPointPos.x = tmpX;
                    creatingNewPointPos.y = tmpY;
                    var i = highlightedCPIndex;
                    // calcualte x axis
                    if (i != 0 && i != controlPoints.length-1) {
                      deltaX += dx;
                      var previousX = controlPoints[i-1].index;
                      var nextX = controlPoints[i+1].index;
                      controlPoints[i].index = tmpIndex + deltaX / tfWidth;
                      if (controlPoints[i].index < previousX) {
                        controlPoints[i].index = previousX;
                      }
                      if (controlPoints[i].index > nextX) {
                        controlPoints[i].index = nextX;
                      }
                    }
                    d3.selectAll('.control-point')
                      .filter(function(d, index) {
                        return (index == i);
                      })
                      .attr('cx', controlPoints[i].index * tfWidth);

                    // calculate y axis
                    deltaY += dy;
                    controlPoints[i].alpha = tmpAlpha - deltaY / tfHeight;
                    if (controlPoints[i].alpha > 1) controlPoints[i].alpha = 1;
                    if (controlPoints[i].alpha < 0) controlPoints[i].alpha = 0;
                      d3.selectAll('.control-point')
                        .filter(function(d, index) {
                          return (index == i);
                        })
                        .attr('cy', (1-controlPoints[i].alpha) * tfHeight);
                    drawTFCurve();
                    refreshGradient();
                    callback.call(tf, controlPoints, controlPointsToArray());
                  }
                })
                .on('mouseup', function(d) {
                  if (creatingNewPoint) {
                    creatingNewPoint = false;
                  }
                });

    drawBackgroundGrids();
    constructGradient();
    drawTFCurve();
    drawColorBars();
    drawControlPoints();
  }

  // Drag control points
  var drag = d3.behavior.drag()
                        .origin(function(d) {return d;})
                        .on('dragstart', dragstart)
                        .on('drag', dragmove)
                        .on('dragend', dragend);

  // Draw control points
  function drawControlPoints() {
    d3.select('#tf-widget svg')
      .selectAll('.control-point')
      .remove();
    d3.select('#tf-widget svg')
      .selectAll('circle')
      .data(controlPoints)
      .enter()
      .append('circle')
      .classed('control-point', true)
      .classed('highlighted', function(d, i) {
        if (i == highlightedCPIndex) return true;
        else return false;
      })
      .attr('cx', function(d) {
        return d.index * tfWidth;
      })
      .attr('cy', function(d) {
        return (1-d.alpha) * tfHeight;
      })
      .attr('r', 5)
      .style('fill', function(d, i) {
        return controlPoints[i].rgb;
      })
      .call(drag)
      .on('dblclick', function(d, i) {
        highlightedCPIndex = i;
        $('.control-point').attr('class', 'control-point');
        $('.control-point')[highlightedCPIndex].setAttribute('class', 'control-point highlighted');
        colorPicker.setColor(controlPoints[highlightedCPIndex].rgb);
      })
      .on('mousedown', function(d, i) {
        if (d3.event.which == 3) {
          removeControlPoints(i);
          callback.call(tf, controlPoints, controlPointsToArray());
        }
      })
      .on('mousemove', function(d, i) {
      });
  }

  // After dragging
  function dragend(d, i) {
    isDrag = false;
    callback.call(tf, controlPoints, controlPointsToArray());
  }

  // Before dragging
  function dragstart(d, i) {
    deltaX = 0;
    deltaY = 0;
    tmpIndex = controlPoints[i].index;
    tmpAlpha = controlPoints[i].alpha;
    isDrag = true;
    callback.call(tf, controlPoints, controlPointsToArray());
  }

  // Drag control points
  function dragmove(d, i) {
    d3.select(this)
      .attr('cx', function() {
        if (i != 0 && i != controlPoints.length-1) {
          deltaX += d3.event.dx;
          var previousX = controlPoints[i-1].index;
          var nextX = controlPoints[i+1].index;
          controlPoints[i].index = tmpIndex + deltaX / tfWidth;
          if (controlPoints[i].index < previousX) {
            controlPoints[i].index = previousX;
          }
          if (controlPoints[i].index > nextX) {
            controlPoints[i].index = nextX;
          }
          return controlPoints[i].index * tfWidth;
        }
        else {
          return controlPoints[i].index * tfWidth;
        }
      })
      .attr('cy', function(){
        deltaY += d3.event.dy;
        controlPoints[i].alpha = tmpAlpha - deltaY / tfHeight;
        if (controlPoints[i].alpha > 1) controlPoints[i].alpha = 1;
        if (controlPoints[i].alpha < 0) controlPoints[i].alpha = 0;
        return (1-d.alpha) * tfHeight;
      });
    drawTFCurve();
    refreshGradient();
    callback.call(tf, controlPoints, controlPointsToArray());
  }

  function resetControlPoints() {
    p0 = new ControlPoint(0.0, 0.0, '#000000');
    p1 = new ControlPoint(1.0, 1.0, '#000000');
    controlPoints = [];
    controlPoints.push(p0);
    controlPoints.push(p1);
    highlightedCPIndex = 1;
    $('.control-point').attr('class', 'control-point');
    $('.control-point')[highlightedCPIndex].setAttribute('class', 'control-point highlighted');
    constructGradient();
    drawControlPoints();
    drawTFCurve();
  }

  var controlPointsToArray = function() {
    var arr = [];
    var c = 0;
    var inter = d3.interpolate(controlPoints[0].rgb, controlPoints[1].rgb);
    var tmpRGB, tmpAlpha;
    var tmpX;
    var tmpP1 = {}, tmpP2 = {}, tmpP3 = {}, tmpP4 = {};
    tmpP1.x = 0; tmpP2.x = 0.5; tmpP3.x = 0.5; tmpP4.x = 1;
    tmpP1.y = controlPoints[0].alpha;
    tmpP2.y = controlPoints[0].alpha;
    tmpP3.y = controlPoints[1].alpha;
    tmpP4.y = controlPoints[1].alpha;
    for (var i = 0; i < 256; i ++) {
      if (i >= controlPoints[c+1].index * 256 && c+1 < controlPoints.length-1) {
        c ++;
        inter = d3.interpolate(controlPoints[c].rgb, controlPoints[c+1].rgb);
        tmpP1.y = controlPoints[c].alpha;
        tmpP2.y = controlPoints[c].alpha;
        tmpP3.y = controlPoints[c+1].alpha;
        tmpP4.y = controlPoints[c+1].alpha;
      }
      tmpX = ((i / 256.0) - controlPoints[c].index) / (controlPoints[c+1].index - controlPoints[c].index);
      tmpRGB = d3.rgb(inter(tmpX));
      arr.push(tmpRGB.r);
      arr.push(tmpRGB.g);
      arr.push(tmpRGB.b);
      tmpAlpha = bezier(tmpX, tmpP1, tmpP2, tmpP3, tmpP4);
      arr.push(tmpAlpha.y);
    }
    return arr;
  }

  /****** Control Point Class ********/
  function ControlPoint(index /*0-1*/, alpha /*0-1*/, rgb/*string*/) {
    this.index = index;
    this.alpha = alpha;
    this.rgb = rgb;
  }

  /*********** Initialize ************/
  // Control points
  var p0 = new ControlPoint(0.0, 0.0, '#000000'),
      p1 = new ControlPoint(1.0, 1.0, '#ffffff');
  var controlPoints = [];
  controlPoints.push(p0);
  controlPoints.push(p1);
  var highlightedCPIndex = 1;

  // Add color picker into div#picker
  //$('#tf-picker').farbtastic(changeColorCallback);
  var colorPicker = $.farbtastic('#tf-picker');
  colorPicker.setColor('#ffffff');
  colorPicker.linkTo(changeColorCallback);

  // Transfer function widget
  var tfWidth = 360,
      tfHeight = 150;

  // Color bar
  var colorBarWidth = tfWidth,
      colorBarHeight = 13,
      colorBarGap = 4;

  // SVG 
  var svgWidth = tfWidth,
      svgHeight = tfHeight + 2 * (colorBarHeight + colorBarGap);

  var deltaX, deltaY;
  var tmpIndex, tmpAlpha;
  var isDrag = false;
  var creatingNewPoint = false;
  var creatingNewPointPos = {};
  initializeTFCanvas();
  document.getElementById('tf-container').oncontextmenu = function() {return false;};

  $('#reset-button').on('click', resetControlPoints);

}
