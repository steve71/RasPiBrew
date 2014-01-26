//
// Copyright (c) 2012-2014 Stephen P. Smith
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
// IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

//declare globals
var t, tempdataarray, heatdataarray, setpointdataarray, dutyCycle, options_temp, options_heat, plot, gaugeDisplay, newGaugeDisplay;
var capture_on = 1;
var tempUnits, temp, setpoint;
t = 0;

function findLS(selected_start, selected_end, in_pointArray) {

	var i;
	var values_x = [];
	var values_y = [];
	var in_pointArrayLength = in_pointArray.length;

	for ( i = 0; i < in_pointArrayLength; i++) {
		values_x.push(in_pointArray[i][0]);
		values_y.push(in_pointArray[i][1]);
	}

	var values_length = values_x.length;

	if (values_length != values_y.length) {
		throw new Error('x and y are not same size.');
	}

	if ((selected_start == 0) || (selected_end == 0)) {
		alert("Make a Selection");
	}
	// find indices	of selection
	var selection_start_index;
	var selection_end_index;
	var found_start = false;
	for ( i = 0; i < values_length; i++) {
		if ((values_x[i] >= selected_start) && (found_start == false)) {
			selection_start_index = i;
			found_start = true;
		}
		if (values_x[i] <= selected_end) {
			selection_end_index = i;
		}
	}

	var sum_x = 0;
	var sum_y = 0;
	var sum_xy = 0;
	var sum_xx = 0;
	var count = 0;
	var x = 0;
	var y = 0;
	/*
	 * Calculate the sum for each of the parts from imax to end
	 */
	for ( i = selection_start_index; i <= selection_end_index; i++) {
		x = values_x[i];
		y = values_y[i];
		sum_x += x;
		sum_y += y;
		sum_xx += x * x;
		sum_xy += x * y;
		count++;
	}

	/*
	 * Calculate m and b for the formula:
	 * y = x * m + b
	 */
	var m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
	var b = (sum_y / count) - (m * sum_x) / count;

	var out_pointArray = [];

	for ( i = selection_start_index; i <= selection_end_index; i++) {
		x = values_x[i];
		y = m * x + b;
		out_pointArray.push([x, y]);
	}

	return [out_pointArray, m, b];
}

function showTooltip(x, y, contents) {
	jQuery('<div id="tooltip">' + contents + '</div>').css({
		position : 'absolute',
		display : 'none',
		top : y + 5,
		left : x + 5,
		border : '1px solid #fdd',
		padding : '2px',
		'background-color' : '#fee',
		opacity : 0.80
	}).appendTo("body").fadeIn(200);
}

//long polling - wait for message
function waitForMsg() {

	jQuery.ajax({
		type : "GET",
		url : "/getstatus",
		dataType : "json",
		async : true,
		cache : false,
		timeout : 50000,

		success : function(data) {

			//alert(data.mode);
			//temp_F = (9.0/5.0)*parseFloat(data.temp) + 32;
			//temp_F = temp_F.toFixed(2);
			//temp_C = (5.0/9.0)*(parseFloat(data.temp) - 32);
			//temp_C = temp_C.toFixed(2);

			jQuery('#tempResponse').html(data.temp);

			if (data.tempUnits == "F") {
				jQuery('#tempResponseUnits').html("&#176F");
				jQuery('#setpointResponseUnits').html("&#176F");
				jQuery('#k_paramResponseUnits').html("%/&#176F");
				jQuery('#setpointInputUnits').html("&#176F");
				jQuery('#k_paramInputUnits').html("%/&#176F");
			} else {
				jQuery('#tempResponseUnits').html("&#176C");
				jQuery('#setpointResponseUnits').html("&#176C");
				jQuery('#k_paramResponseUnits').html("%/&#176C");
				jQuery('#setpointInputUnits').html("&#176C");
				jQuery('#k_paramInputUnits').html("%/&#176C");
			}

			jQuery('#modeResponse').html(data.mode);
			jQuery('#setpointResponse').html(data.set_point);
			jQuery('#dutycycleResponse').html(parseFloat(data.duty_cycle).toFixed(2));
			dutyCycle = data.duty_cycle;
			jQuery('#cycletimeResponse').html(data.cycle_time);
			jQuery('#k_paramResponse').html(data.k_param);
			jQuery('#i_paramResponse').html(data.i_param);
			jQuery('#d_paramResponse').html(data.d_param);

			gaugeDisplay.setValue(parseFloat(data.temp));

			if (data.mode == "auto") {
				//setpoint_C = (5.0/9.0)*(parseFloat(data.set_point) - 32);
				setpointdataarray.push([t, parseFloat(data.set_point)]);
			} else {
				setpointdataarray = [];
			}

			tempdataarray.push([t, parseFloat(data.temp)]);
			heatdataarray.push([t, parseFloat(data.duty_cycle)]);

			//tempdataarray.push([i,parseFloat(data.temp)]);
			//heatdataarray.push([i,parseFloat(data.duty_cycle)]);

			while (tempdataarray.length > jQuery('#windowSizeText').val()) {
				tempdataarray.shift();
			}

			while (heatdataarray.length > jQuery('#windowSizeText').val()) {
				heatdataarray.shift();
			}

			t += parseFloat(data.elapsed);

			jQuery('#windowSizeText').change(function() {
				tempdataarray = [];
				heatdataarray = [];
				t = 0;
			});

			//i++;
			if (capture_on == 1) {
				if (data.mode == "auto") {
					plot = jQuery.plot($("#tempplot"), [tempdataarray, setpointdataarray], options_temp);
				} else {
					plot = jQuery.plot($("#tempplot"), [tempdataarray], options_temp);
				}
				plot = jQuery.plot($("#heatplot"), [heatdataarray], options_heat);
				//plot.setData([dataarray]);
				//plot.draw();
				setTimeout('waitForMsg()', 1);
				//in millisec
			}
		}
	});

};
jQuery(document).ready(function() {

	jQuery('#stop').click(function() {
		capture_on = 0;
	});
	jQuery('#restart').click(function() {
		capture_on = 1;
		tempdataarray = [];
		heatdataarray = [];
		t = 0;
		waitForMsg();
	});
	//jQuery('#calcpid').click(function() {
	//});
	jQuery("#tempplot").bind("plotselected", function(event, ranges) {
		var selected_start = ranges.xaxis.from;
		var selected_end = ranges.xaxis.to;
		var k_param, i_param, d_param, normalizedSlope, pointArray, m, b, deadTime; [pointArray, m, b] = findLS(selected_start, selected_end, tempdataarray);
		deadTime = pointArray[0][0];
		normalizedSlope = m / jQuery('input:text[name=dutycycle]').val();
		jQuery('#deadTime').html(deadTime);
		jQuery('#normSlope').html(normalizedSlope);
		plot = jQuery.plot($("#tempplot"), [tempdataarray, pointArray], options_temp);
		k_param = 1.2 / (deadTime * normalizedSlope);
		i_param = 2.0 * deadTime;
		d_param = 0.5 * deadTime;
		jQuery('#Kc_tune').html(k_param.toFixed(2).toString());
		jQuery('#I_tune').html(i_param.toFixed(2).toString());
		jQuery('#D_tune').html(d_param.toFixed(2).toString());
	});

	var previousPoint = null;
	jQuery("#tempplot").bind("plothover", function(event, pos, item) {
		if (item) {
			if (previousPoint != item.dataIndex) {
				previousPoint = item.dataIndex;

				jQuery("#tooltip").remove();
				var x = item.datapoint[0].toFixed(2), y = item.datapoint[1].toFixed(2);

				showTooltip(item.pageX, item.pageY, "(" + x + ", " + y + ")");
			}
		} else {
			jQuery("#tooltip").remove();
			previousPoint = null;
		}

	});

	jQuery('#controlPanelForm').submit(function() {

		formdata = jQuery(this).serialize();

		jQuery.ajax({
			type : "POST",
			data : formdata,
			success : function(data) {
			},
		});
		//reset plot
		if (jQuery('#off').is(':checked') == false) {
			tempdataarray = [];
			heatdataarray = [];
			setpointdataarray = [];
			t = 0;
		}
		return false;
	});

	//draw gauge
	var options_gauge = {
		majorTickLabel : true,
		value : 60,
		label : 'Temp',
		unitsLabel : '' + String.fromCharCode(186),
		min : 60,
		max : 220,
		majorTicks : 9,
		minorTicks : 9, // small ticks inside each major tick
		greenFrom : 60,
		greenTo : 95,
		yellowFrom : 95,
		yellowTo : 150,
		redFrom : 150,
		redTo : 200
	};

	gaugeDisplay = new Gauge(document.getElementById('tempGauge'), options_gauge);

	// line plot Settings
	i = 0;
	tempdataarray = [];
	heatdataarray = [];

	options_temp = {
		series : {
			lines : {
				show : true
			},
			//points: {show: true},
			shadowSize : 0
		},
		yaxis : {
			min : null,
			max : null
		},
		xaxis : {
			show : true
		},
		grid : {
			hoverable : true
			//  clickable: true
		},
		selection : {
			mode : "x"
		}
	};

	options_heat = {
		series : {
			lines : {
				show : true
			},
			//points: {show: true},
			shadowSize : 0
		},
		yaxis : {
			min : 0,
			max : 100
		},
		xaxis : {
			show : true
		},
		selection : {
			mode : "x"
		}
	};

	waitForMsg();

});
