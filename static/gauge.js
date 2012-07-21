/*
 * Jsgauge 0.4.4
 * http://code.google.com/p/jsgauge/
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */
/*jslint browser: true */

/**
 * Creates a new Gauge
 * @param {DOM Object} canvas           The gauge will be created inside of this canvas element
 * @param {Object} options              Optional parameters
 * @constructor
 */
function Gauge( canvas, options ) {
    var that = this;

    this.requestAnimFrame = window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        window.oRequestAnimationFrame || 
        window.msRequestAnimationFrame;
        
    this.cancelRequestAnimFrame = window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame;
        
    this.animationToken = null;

    this.canvas = canvas;


    function setOptions(options) {
        // Gauge settings
        that.settings = {
            value: options.value || 0,
            valueFormat: options.valueFormat || null,
            pointerValue: options.value || 0,
            label: options.label || '',
            unitsLabel: options.unitsLabel || '',
            min: options.min || 0,
            max: options.max || 100,
            majorTicks: options.majorTicks || 5,
            minorTicks: options.minorTicks || 2, // small ticks inside each major tick
            bands: [].concat(options.bands || []),
            majorTickLabel: options.majorTickLabel || false,	// show major tick label

            // START - Deprecated
            greenFrom: [].concat(options.greenFrom || 0),
            greenTo: [].concat(options.greenTo || 0),
            yellowFrom: [].concat(options.yellowFrom || 0),
            yellowTo: [].concat(options.yellowTo || 0),
            redFrom: [].concat(options.redFrom || 0),
            redTo: [].concat(options.redTo || 0)
            // END - Deprecated
        };


        // Colors used to render the gauge
        that.colors = {
            text:    options.colorOfText || 'rgb(0, 0, 0)',
            warningText:    options.colorOfWarningText || 'rgb(255, 0, 0)',
            fill:    options.colorOfFill || [ '#111', '#ccc', '#ddd', '#eee' ],
            pointerFill:    options.colorOfPointerFill || 'rgba(255, 100, 0, 0.7)',
            pointerStroke:    options.colorOfPointerStroke || 'rgba(255, 100, 100, 0.9)',
            centerCircleFill:    options.colorOfCenterCircleFill || 'rgba(0, 100, 255, 1)',
            centerCircleStroke:    options.colorOfCenterCircleStroke || 'rgba(0, 0, 255, 1)',

            // START - Deprecated
            redBand: options.colorOfRedBand || options.redColor || 'rgba(255, 0, 0, 0.2)',
            yelBand: options.colorOfYellowBand || options.yellowColor || 'rgba(255, 215, 0, 0.2)',
            grnBand: options.colorOfGreenBand || options.greenColor || 'rgba(0, 255, 0, 0.2)'
            // END - Deprecated
        };

        // Add colors to the bands object
        for(var i=that.settings.redFrom.length; i--;){
            that.settings.bands.push({ // Red
                color: that.colors.redBand,
                from: that.settings.redFrom[i],
                to: that.settings.redTo[i]
            });
        }
        for(i=that.settings.yellowFrom.length; i--;){
            that.settings.bands.push({ // Yellow
                color: that.colors.yelBand,
                from: that.settings.yellowFrom[i],
                to: that.settings.yellowTo[i]
            });
        }
        for(i=that.settings.greenFrom.length; i--;){
            that.settings.bands.push({ // Green
                color: that.colors.grnBand,
                from: that.settings.greenFrom[i],
                to: that.settings.greenTo[i]
            });
        }

        that.relSettings = normalize( that.settings );
    }

    // settings normalized to a [0, 100] interval
    function normalize( settings ) {
        var i,
        span = settings.max - settings.min,
        spanPct = span/100,
        normalized;

        // Restrict pointer to range of values
        if (settings.pointerValue > settings.max){
            settings.pointerValue = settings.max;
        } else if(settings.pointerValue < settings.min){
            settings.pointerValue = settings.min;
        }

        normalized = {
            min: 0,
            max: 100,
            value: ( settings.value - settings.min ) / spanPct,
            pointerValue: ( settings.pointerValue - settings.min ) / spanPct,
            label: settings.label || '',
            greenFrom: [],
            greenTo: [],
            yellowFrom: [],
            yellowTo: [],
            redFrom: [],
            redTo: [],
            bands: [],
            // also fix some possible invalid settings
            majorTicks: Math.max( 2, settings.majorTicks ),
            minorTicks: Math.max( 0, settings.minorTicks ),
            decimals: Math.max( 0, 3 - ( settings.max - settings.min ).toFixed( 0 ).length )
        };

        for(i=settings.bands.length;i--;) {
            var band = settings.bands[i];
            normalized.bands[i] = {
                color: band.color,
                from: (band.from - settings.min)/spanPct,
                to: (band.to - settings.min)/spanPct
            };
        }

        return normalized;
    }

    function formatValue(value, decimals) {
        var
        ret;

        // Custom formatter
        if (typeof that.settings.valueFormat == 'function') {
            return that.settings.valueFormat(value, decimals); //-->
        }

        // Default formatter
        ret = (parseFloat(value)).toFixed( decimals );
        while ( ( decimals > 0 ) && ret.match( /^(-)?\d+\.(\d+)?0$/ ) ) {
            decimals -= 1;
            ret = (parseFloat(value)).toFixed( decimals );
        }
        return ret;
    }

    // Private helper functions
    function styleText( context, style ) {
        context.font = style;
        context.mozTextStyle = style; // FF3
    }

    function measureText(context, text) {
        if (context.measureText) {
            return context.measureText(text).width; //-->
        } else if (context.mozMeasureText) { //FF < 3.5
            return context.mozMeasureText(text); //-->
        }
        throw "measureText() not supported!";
    }

    function fillText(context, text, px, py) {
        var width;
        if (context.fillText) {
            return context.fillText(text, px, py);
        } else if (context.mozDrawText) { //FF < 3.5
            context.save();
            context.translate(px, py);
            width = context.mozDrawText(text);
            context.restore();
            return width;
        }
        throw "fillText() not supported!";
    }

    this.setOptions = setOptions;
    this.setOptions(options || {});

    this.drawBackground = function( ) {
        var fill = that.colors.fill,
        rad = [ this.radius, this.radius - 1, this.radius * 0.98, this.radius * 0.95 ],
        i;

        this.c2d.rotate( this.startDeg );
        for ( i = 0; i < fill.length; i++ ) {
            this.c2d.fillStyle = fill[ i ];
            this.c2d.beginPath();
            this.c2d.arc( 0, 0, rad[ i ], 0, this.spanDeg, false );
            this.c2d.fill();
        }
    };

    this.drawRange = function( from, to, style ) {
        if ( to > from ) {
            var span = this.spanDeg * ( to - from ) / 100;

            this.c2d.rotate( this.startDeg );
            this.c2d.fillStyle = style;
            this.c2d.rotate( this.spanDeg * from / 100 );
            this.c2d.beginPath();
            this.c2d.moveTo( this.innerRadius, 0 );
            this.c2d.lineTo( this.outerRadius, 0 );
            this.c2d.arc( 0, 0, this.outerRadius, 0, span, false );
            this.c2d.rotate( span );
            this.c2d.lineTo( this.innerRadius, 0 );
            this.c2d.arc( 0, 0, this.innerRadius, 0, - span, true );
            this.c2d.fill();
        }
    };

    this.drawTicks = function( majorTicks, minorTicks ) {
        var majorSpan,
        i, j;
        // major ticks
        this.c2d.rotate( this.startDeg );
        this.c2d.lineWidth = this.radius * 0.025;
        majorSpan = this.spanDeg / ( majorTicks - 1 );
        for ( i = 0; i < majorTicks; i++ ) {
            this.c2d.beginPath();
            this.c2d.moveTo( this.innerRadius,0 );
            this.c2d.lineTo( this.outerRadius,0 );
            this.c2d.stroke();

            // minor ticks
            if ( i + 1 < majorTicks ) {
                this.c2d.save();
                this.c2d.lineWidth = this.radius * 0.01;
                var minorSpan = majorSpan / ( minorTicks + 1 );
                for ( j = 0; j < minorTicks; j++ ) {
                    this.c2d.rotate( minorSpan );
                    this.c2d.beginPath();
                    this.c2d.moveTo( this.innerRadius + ( this.outerRadius - this.innerRadius ) / 3, 0 );
                    this.c2d.lineTo( this.outerRadius, 0 );
                    this.c2d.stroke();
                }
                this.c2d.restore();
            }
            this.c2d.rotate( majorSpan );
        }
    };

    this.drawPointer = function( value ) {
        function pointer( ctx ) {
            ctx.c2d.beginPath();
            ctx.c2d.moveTo( - ctx.radius * 0.2, 0 );
            ctx.c2d.lineTo(	0, ctx.radius * 0.05 );
            ctx.c2d.lineTo( ctx.radius * 0.8, 0 );
            ctx.c2d.lineTo( 0, - ctx.radius * 0.05 );
            ctx.c2d.lineTo( - ctx.radius * 0.2, 0 );
        }
        this.c2d.rotate( this.startDeg );
        this.c2d.rotate( this.spanDeg * value / 100 );
        this.c2d.lineWidth = this.radius * 0.015;
        this.c2d.fillStyle = that.colors.pointerFill;
        pointer( this );
        this.c2d.fill();
        this.c2d.strokeStyle = that.colors.pointerStroke; 
        pointer( this );
        this.c2d.stroke();
        // center circle
        this.c2d.fillStyle = that.colors.centerCircleFill;
        this.c2d.beginPath();
        this.c2d.arc( 0, 0, this.radius * 0.1, 0, Math.PI * 2, true );
        this.c2d.fill();
        this.c2d.strokeStyle = that.colors.centerCircleStroke;
        this.c2d.beginPath();
        this.c2d.arc( 0, 0, this.radius * 0.1, 0, Math.PI * 2, true );
        this.c2d.stroke();
    };

    this.drawCaption = function( label ) {
        if ( label ) {
            var fontSize = this.radius / 5;
            styleText( this.c2d, fontSize.toFixed(0) + 'px sans-serif');
            var metrics = measureText( this.c2d, label );
            this.c2d.fillStyle = that.colors.text;
            var px = - metrics/ 2;
            var py = - this.radius * 0.4 + fontSize / 2;
            fillText( this.c2d, label, px, py );
        }
    };

    this.drawValues = function( min, max, value, decimals, majorTicks ) {
        var deg, fontSize, metrics, valueText;

        // value text
        valueText = formatValue( value, decimals ) + that.settings.unitsLabel;
        fontSize = this.radius / 5;
        styleText( this.c2d, fontSize.toFixed(0) + 'px sans-serif');
        metrics = measureText( this.c2d, valueText );
        if (value < min || value > max) { // Outside min/max ranges?
            this.c2d.fillStyle = that.colors.warningText;
        } else {
            this.c2d.fillStyle = that.colors.text;
        }
        fillText( this.c2d, valueText, - metrics/ 2, this.radius * 0.72 );

		// terryc: major tick label
		if (majorTicks > 1) {
			var radiusSpan = 13 / (majorTicks - 1);
			var tickNum = (max - min) / (majorTicks - 1);
			fontSize = this.radius / 8;
			for (var i = 1, j = min + tickNum; i < (majorTicks - 1); i++, j += tickNum) {
				var x, y, z;
				metrics = measureText( this.c2d, formatValue(j, decimals ) );
				z = (14.5 - (radiusSpan * i));
				x = 0;
				y = 0;
				if (z <= 6) {
					x = -(metrics/3) * 2;
				}
				else if (6 < z && z < 10) {
					x = -((10-z)/2) * (metrics/3);
				}
				
				if (z <= 2 || z >= 14) {
					y = -(fontSize / 2);
				}
				else if (6 <= z &&  z <= 10) {
					y = fontSize / 2;
				} else if (2 < z && z < 6) {
					y = (z - 4) * fontSize / 4;
				}
				else if (10 < z &&  z < 14) {
					y = (12 - z) * fontSize / 4;
				}
				this.save();
				deg = Math.PI * z/8;
				this.c2d.translate( this.radius * 0.65 * Math.sin( deg ),
					this.radius * 0.65 * Math.cos( deg ));
				styleText( this.c2d, fontSize.toFixed(0) + 'px sans-serif');
				this.c2d.fillStyle = that.colors.text;
				fillText( this.c2d, formatValue( j, decimals ), x, y );
				this.restore();
			}
		}

        // min label
        this.save();
        deg = Math.PI * 14.5/8;
        this.c2d.translate( this.radius * 0.65 * Math.sin( deg ),
                           this.radius * 0.65 * Math.cos( deg ) );
                           fontSize = this.radius / 8;
                           styleText( this.c2d, fontSize.toFixed(0) + 'px sans-serif');
                           this.c2d.fillStyle = that.colors.text;
                           fillText( this.c2d, formatValue( min, decimals ), 0, 0 );
                           this.restore();

                           // max label
                           this.save();
                           deg = Math.PI * 1.5/8;
                           this.c2d.translate( this.radius * 0.65 * Math.sin( deg ),
                                              this.radius * 0.65 * Math.cos( deg ) );
                                              fontSize = this.radius / 8;
                                              styleText( this.c2d, fontSize.toFixed(0) + 'px sans-serif');
                                              metrics = measureText( this.c2d, formatValue( max, decimals ) );
                                              this.c2d.fillStyle = that.colors.text;
                                              fillText( this.c2d, formatValue( max, decimals ), - metrics, 0 );
                                              this.restore();
    };

    this.draw();

    return this;
}

Gauge.prototype.setValue = function( value ) {
    var that = this,
        pointerValue = (value > that.settings.max) ?
          that.settings.max :  // Nomalize to max value
          (value < that.settings.min) ?
          that.settings.min :  // Nomalize to min value
          value,
//        increment = Math.abs( that.settings.pointerValue - pointerValue ) / 20;
		increment = Math.max(Math.abs( that.settings.pointerValue - pointerValue ) / 8, 3);
        
    // Clear timeouts
    if (that.animationToken !== null) {
        //try {
            if (that.cancelRequestAnimFrame){
                if (that.cancelRequestAnimFrame.arguments != null) {
                    that.cancelRequestAnimFrame(that.animationToken);
                }
            } else {
                clearTimeout(that.animationToken);
            }
        //} catch (e){}
        that.animationToken = null;
    }

    function adjustValue() {
        var span;
        if ( that.settings.pointerValue < pointerValue ) {
            that.settings.pointerValue += increment;
            if ( that.settings.pointerValue + increment >= pointerValue ) {
                that.settings.pointerValue = pointerValue;
            }
        } else {
            that.settings.pointerValue -= increment;
            if ( that.settings.pointerValue - increment <= pointerValue ) {
                that.settings.pointerValue = pointerValue;
            }
        }
        span = that.settings.max - that.settings.min;
        that.relSettings.pointerValue = (that.settings.pointerValue -
                                         that.settings.min) / (span / 100);
        that.draw();
        if (that.settings.pointerValue != pointerValue) {
            if (typeof that.requestAnimFrame != 'undefined') {
                that.animationToken = that.requestAnimFrame.call(window, adjustValue);
            } else {
                that.animationToken = setTimeout(adjustValue, 1000 / 60); // Draw another frame
            }
        } else {
            // There is no more animation, so clear the token
            that.animationToken = null;
        }
    }

    if ( !isNaN(value) && this.settings.value !== value ) {
        this.settings.value = value;
        adjustValue();
    }
};

Gauge.prototype.draw = function() {
    var r, g, y;

    if ( ! this.canvas.getContext ) {
        return; //-->
    }

    var drawCtx = {
        c2d: this.canvas.getContext( '2d' ),
        startDeg: Math.PI * 5.5 / 8,
        spanDeg: Math.PI * 13 / 8,
        save: function() {
            this.c2d.save();
        },
        restore: function() {
            this.c2d.restore();
        },
        call: function( fn ) {
            var args = Array.prototype.slice.call( arguments );
            this.save();
            this.translateCenter();
            fn.apply( this, args.slice( 1 ) );
            this.restore();
        },
        clear: function() {
            this.c2d.clearRect( 0, 0, this.width, this.height );
        },
        translateCenter: function() {
            this.c2d.translate( this.centerX, this.centerY );
        }
    };

    drawCtx.width = drawCtx.c2d.canvas.width;
    drawCtx.height = drawCtx.c2d.canvas.height;
    drawCtx.radius = Math.min( drawCtx.width / 2 - 4, drawCtx.height / 2 - 4 );
    drawCtx.innerRadius = drawCtx.radius * 0.7;
    drawCtx.outerRadius = drawCtx.radius * 0.9;
    drawCtx.centerX = drawCtx.radius + 4;
    drawCtx.centerY = drawCtx.radius + 4 + ( drawCtx.radius -
                                            drawCtx.radius * Math.sin( drawCtx.startDeg ) ) / 2;

    // draw everything
    drawCtx.clear();
    drawCtx.call( this.drawBackground );
    for(var i = this.relSettings.bands.length; i--;) {
        var band = this.relSettings.bands[i];
        drawCtx.call(this.drawRange, band.from, band.to, band.color);

    }
    drawCtx.call( this.drawTicks, this.relSettings.majorTicks, this.relSettings.minorTicks );
    drawCtx.call( this.drawPointer, this.relSettings.pointerValue );
    drawCtx.call( this.drawCaption, this.relSettings.label );
    drawCtx.call( this.drawValues, 
                 this.settings.min,
                 this.settings.max,
                 this.settings.value,
                 this.relSettings.decimals,
               ((this.settings.majorTickLabel == true)? this.relSettings.majorTicks : 0));
};
