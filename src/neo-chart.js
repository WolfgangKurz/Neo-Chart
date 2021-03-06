/*!
 * Neo-Chart.js
 * https://github.com/WolfgangKurz/Neo-Chart
 * Version: 1.0.14
 *
 * Copyright 2016-2018 Wolfgang Kurz
 * Released under the MIT license
 * https://github.com/WolfgangKurz/Neo-Chart/blob/master/LICENSE
 */
"use strict";
!function(){
	var $ = function(x){ return document.querySelector(x) };
	$.find = function(x, y){ return x.querySelector(y) };
	HTMLElement.prototype.find = function(x){ return this.querySelector(x) };
	HTMLElement.prototype.attr = function(x, y){ if(typeof y=="undefined") return this.getAttribute(x); this.setAttribute(x, y); return this };

	window.neoChart = function(canvas){
		var ctx = canvas.getContext("2d");

		var opt = $("."+canvas.attr("data-target"));
		var properties = {
			index: -1,
			baseX: 0,
			cellWidth: 0
		};
		var options = {
			title: canvas.attr("data-title") ? canvas.attr("data-title") : "",
			font: canvas.attr("data-font") ? canvas.attr("data-font") : "12px Arial",
			popupFont: canvas.attr("data-popup-font") ? canvas.attr("data-popup-font") : "bold 12px Arial",
			titleFont: canvas.attr("data-title-font") ? canvas.attr("data-title-font") : "bold 16px Arial",
			background: canvas.attr("data-background") ? canvas.attr("data-background") : "#FFFFFF",
			gridVertColor: canvas.attr("data-vert-grid-color") ? canvas.attr("data-vert-grid-color") : "#e8e8e8",
			gridHorzColor: canvas.attr("data-horz-grid-color") ? canvas.attr("data-horz-grid-color") : "#b6b6b6",
			baselineColor: canvas.attr("data-baseline-color") ? canvas.attr("data-baseline-color") : "#b6b6b6",
			labels: opt.find(".chart-data-label").value.split(","),
			style: canvas.attr("data-style") ? canvas.attr("data-style").split(",") : ["line"],
			"x-prefix": canvas.attr("data-x-prefix") ? canvas.attr("data-x-prefix") : "",
			"x-postfix": canvas.attr("data-x-postfix") ? canvas.attr("data-x-postfix") : "",
			"y-prefix": canvas.attr("data-y-prefix") ? canvas.attr("data-y-prefix") : "",
			"y-postfix": canvas.attr("data-y-postfix") ? canvas.attr("data-y-postfix") : "",
			"bar-y-prefix": canvas.attr("data-bar-y-prefix") ? canvas.attr("data-bar-y-prefix") : "",
			"bar-y-postfix": canvas.attr("data-bar-y-postfix") ? canvas.attr("data-bar-y-postfix") : "",
			min: canvas.attr("data-min") ? parseInt(canvas.attr("data-min")) : 0,
			max: canvas.attr("data-min") ? parseInt(canvas.attr("data-max")) : 100,
			bars: canvas.attr("data-bars") ? parseInt(canvas.attr("data-bars")) : 1,
			splits: canvas.attr("data-split") ? parseInt(canvas.attr("data-split")) : parseInt(canvas.height/36),
			type: canvas.attr("data-type"),
		};
		options["bar-min"] = canvas.attr("data-bar-min") ? parseInt(canvas.attr("data-bar-min")) : options.min;
		options["bar-max"] = canvas.attr("data-bar-max") ? parseInt(canvas.attr("data-bar-max")) : options.max;

		for(var k=0; k<options.style.length; k++){
			var datasets = [], nameset = [], colorset = [], tcolorset = [];
			for(var i=0; ; i++){
				var dataset = opt.find(".chart-data-" + options.style[k] + "-dataset"+i);
				if( dataset==null ) break;

				var datas = [];
				dataset = dataset.value.split(",");

				for(var j=0; j<dataset.length; j++){
					if( dataset[j].toString().indexOf(";")>=0 ){
						var part = dataset[j].toString().split(";");
						for(var u=0; u<part.length; u++) part[u] = parseFloat(part[u]);
						datas.push(part);
					}else{
						datas.push( parseFloat(dataset[j]) );
					}
				}
				datasets.push(datas);

				var colors = opt.find(".chart-data-" + options.style[k] + "-color"+i).value.split(",");
				colorset.push(colors);

				var colors = opt.find(".chart-data-" + options.style[k] + "-text-color"+i);
				if(colors!=null) tcolorset.push(colors.value.split(","));

				var names = opt.find(".chart-data-" + options.style[k] + "-dataname"+i);
				if(names!=null) nameset.push(names.value.split(","));
			}

			options[options.style[k] + "-dataset"] = datasets;
			options[options.style[k] + "-names"] = nameset;
			options[options.style[k] + "-colors"] = colorset;
			options[options.style[k] + "-text-colors"] = tcolorset.length==0 ? colorset : tcolorset;
		}

		var styleAlign = ["bar","line"];
		var aligned = [];
		for(var i=0; i<styleAlign.length; i++){
			for(var j=0; j<options.style.length; j++){
				if( aligned.indexOf(options.style[j])>=0 ) continue;

				if(styleAlign[i]==options.style[j]){
					aligned.push( options.style[j] );
					break;
				}
			}
			for(var j=0; j<options.style.length; j++){
				if( aligned.indexOf(options.style[j])>=0 ) continue;
				aligned.push( options.style[j] );
			}
		}
		options.style = aligned;

		var renderGraph = function(){
			var width = canvas.width, height = canvas.height;
			var range = options.max - options.min;
			var barRange = options["bar-max"] - options["bar-min"];
			var baseX = 0, baseX2 = 0, baseY = 0;
			var baseOffset, baseWidth;
			var barWidth = 0;
			var textSize, w, h;

			var xAxis = function(v){ return options["x-prefix"] + v + options["x-postfix"] };
			var yAxis = function(v){ return options["y-prefix"] + (isNaN(v) ? "-" : v) + options["y-postfix"] };
			var yBarAxis = function(v){ return options["bar-y-prefix"] + (isNaN(v) ? "-" : v) + options["bar-y-postfix"] };

			ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset translates

			ctx.lineWidth = 0.9;
			ctx.fillStyle = options.background;

			ctx.clearRect(0, 0, width, height);
			ctx.fillRect(0, 0, width, height);

			ctx.translate(0.5, 0.5);

			//////////////////////////////////////

			ctx.font = options.font;

			textSize = ctx.measureText(yAxis(options.max));
			baseX = parseInt(textSize.width);
			baseOffset = baseX;
			baseWidth = width - 8 - 8 - 4 - parseInt(baseX) - 12;

			baseOffset += parseInt(baseWidth / options.labels.length / 2);
			// baseWidth -= baseX;

			textSize = ctx.measureText(xAxis(options.labels[0]));
			baseY = 12 * 1.5;

			////// Styles preprocess
			for(var i=0; i<options.style.length; i++){
				if( options.style[i]=="bar" ){
					var x = parseInt(baseWidth / options.labels.length / 2);
					barWidth = x / options.bars;

					textSize = ctx.measureText(yBarAxis(options["bar-max"]));
					baseX2 = parseInt(textSize.width);
					baseOffset -= 4;

					width -= baseX2 + 8;
					baseWidth -= baseX2 + 14;
				}
			}

			properties.baseX = 8 + baseX + 4 + 8;
			properties.cellWidth = baseWidth / options.labels.length;
			properties.bottom = height - 8 - baseY - 8;
			properties.top = 8;

			////// Title
			if(options.title.length>0){
				ctx.translate(0, 20);
				properties.top += 20;
				height -= 20;

				ctx.fillStyle = "#7c7c7c";
				ctx.font = options.titleFont;
				textSize = ctx.measureText(options.title);
				ctx.fillText(options.title, width/2 - textSize.width/2, 0);
			}
			ctx.font = options.font;
			ctx.fillStyle = "#8c8c8c";
			ctx.strokeStyle = options.gridHorzColor;

			////// Horizontal Labels
			for(var i=0; i<options.labels.length; i++){
				// current Index
				if(properties.index==i){
					ctx.fillStyle = "rgba(212,212,212,0.17)";
					var x = (parseInt(baseWidth * i - baseWidth / 2) / options.labels.length);
					ctx.fillRect(
						8 + baseOffset + 4 + 8 + x, 8,
						baseWidth / options.labels.length, // grid size
						height - 8 - baseY - 8 - 8
					);

					ctx.fillStyle = "#8c8c8c";
				}

				var x = xAxis(options.labels[i]);
				textSize = ctx.measureText(x);
				w = textSize.width;
				ctx.fillText(x, 8 + baseOffset + 4 + 8 + (baseWidth * i / options.labels.length) - w/2, height - baseY + 4);

				x = parseInt((baseWidth * i + baseWidth / 2) / options.labels.length);
				ctx.strokeStyle = options.gridVertColor;
				ctx.beginPath();
					ctx.moveTo(8 + baseOffset + 4 + 8 + x, 12);
					ctx.lineTo(8 + baseOffset + 4 + 8 + x,  height - 8 - baseY - 8);
				ctx.closePath();
				ctx.stroke();

				ctx.strokeStyle = options.gridHorzColor;
				ctx.beginPath();
					ctx.moveTo(8 + baseOffset + 4 + 8 + x, height - 8 - baseY - 8);
					ctx.lineTo(8 + baseOffset + 4 + 8 + x,  height - 8 - baseY);
				ctx.closePath();
				ctx.stroke();
			}

			////// Vertical Values
			ctx.beginPath();
				for(var i=0; i<(options.splits+1); i++){
					var y = yAxis(options.max - parseInt((options.max-options.min) * i / options.splits));
					textSize = ctx.measureText(y);
					w = textSize.width;
					ctx.fillText(y, 8 + baseX - w, 8 + (height - 8 - baseY) * i / (options.splits+1) + 18);

					if(i<options.splits){
						y = parseInt((height - 8 - baseY) * i / (options.splits+1));
						ctx.moveTo(8 + baseX + 4, 8 + y + 14);
						ctx.lineTo(width - 12,  8 + y + 14);
					}
					if(baseX2>0){
						var y = yBarAxis(options["bar-max"] - parseInt((options["bar-max"]-options["bar-min"]) * i / options.splits));
						ctx.fillText(y, width - 8, 8 + (height - 8 - baseY) * i / (options.splits+1) + 18);
					}
				}
			ctx.closePath();
			ctx.stroke();

			////// Baseline
			ctx.strokeStyle = options.baselineColor;

			// Horizontal Base Line
			ctx.beginPath();
				ctx.moveTo(8 + baseX + 4, height - 8 - baseY - 8);
				ctx.lineTo(width - 12,  height - 8 - baseY - 8);
			ctx.closePath();
			ctx.stroke();

			// Vertical Base Line
			ctx.beginPath();
				ctx.moveTo(8 + baseX + 4 + 8, 12);
				ctx.lineTo(8 + baseX + 4 + 8, height - 8 - baseY);

				if(baseX2>0){
					ctx.moveTo(width - 8 - 8 - 4, 12);
					ctx.lineTo(width - 8 - 8 - 4, height - 8 - baseY);
				}
			ctx.closePath();
			ctx.stroke();

			////// Process Values
			var maxW = 0;
			ctx.font = options.popupFont;
			for(var u=0; u<options.style.length; u++){
				switch(options.style[u]){
					case "line":
						////// Values (Lines)
						ctx.lineWidth = 1.3;
						for(var i=0; i<options["line-dataset"].length; i++){
							var dataset = options["line-dataset"][i];
							ctx.strokeStyle = options["line-colors"][i];

							ctx.beginPath();
							for(var j=0; j<dataset.length; j++){
								var y = (height - baseY - 38) * dataset[j] / range;

								if(j==0)
									ctx.moveTo(
										8 + baseOffset + 4 + 8 + parseInt(baseWidth * j / options.labels.length),
										(height - 8 - baseY - 8) - y
									);
								else
									ctx.lineTo(
										8 + baseOffset + 4 + 8 + parseInt(baseWidth * j / options.labels.length),
										(height - 8 - baseY - 8) - y
									);
							}
							ctx.stroke();
						}

						////// Values (Circles)
						for(var i=0; i<options["line-dataset"].length; i++){
							var dataset = options["line-dataset"][i];

							for(var j=0; j<dataset.length; j++){
								var x = 8 + baseOffset + 4 + 8 + parseInt(baseWidth * j / options.labels.length);
								var y = (height - baseY - 38) * dataset[j] / range;

								ctx.lineWidth = 1.78;
								ctx.strokeStyle = options["line-colors"][i];
								ctx.beginPath();
									ctx.arc(x, (height - 8 - baseY - 8) - y, 3, 0, Math.PI*2, true);
								ctx.closePath();
								ctx.stroke();

								ctx.lineWidth = 1.3;
								ctx.strokeStyle = "#FFFFFF";
								ctx.beginPath();
									ctx.arc(x, (height - 8 - baseY - 8) - y, 4.3, 0, Math.PI*2, true);
								ctx.closePath();
								ctx.stroke();

								ctx.fillStyle = options["line-colors"][i];
								ctx.save();
									textSize = ctx.measureText( yAxis(dataset[j]) );
									ctx.shadowColor = "rgba(0, 0, 0, 0.17)";
									ctx.shadowOffsetX = 0; 
									ctx.shadowOffsetY = 0; 
									ctx.shadowBlur = 7;

									maxW = Math.max(textSize.width, maxW);

									var tY = (height-8-baseY-8) - y +12+8;
									if(tY+10 > (height-8-baseY-8)) tY -= 28;

									ctx.fillText(yAxis(dataset[j]), x - parseInt(textSize.width/2), tY);
								ctx.restore();
							}
						}
						break;
					case "bar":
						////// Values (Lines)
						ctx.lineWidth = 0.9;
						for(var i=0; i<options["bar-dataset"].length; i++){
							var dataset = options["bar-dataset"][i];
							ctx.strokeStyle = "#727272";

							for(var j=0; j<dataset.length; j++){
								var x = 8 + baseOffset + 4 + 8 + parseInt(baseWidth * j / options.labels.length);

								if(typeof dataset[j]=="object"){
									for(var k=0; k<Math.min(dataset[j].length,options.bars); k++){
										ctx.fillStyle = options["bar-colors"][i][k];
										var y = (height - baseY - 38) * dataset[j][k] / barRange;

										ctx.fillRect(
											x - barWidth/2*options.bars + k * barWidth,
											(height - 8 - baseY - 8) - y,
											barWidth, y
										);
										ctx.strokeRect(
											x - barWidth/2*options.bars + k * barWidth,
											(height - 8 - baseY - 8) - y,
											barWidth, y
										);

										textSize = ctx.measureText(dataset[j][k]);
										maxW = Math.max(textSize.width, maxW);
									}
								}else{
									ctx.fillStyle = options["bar-colors"][j][0];

									var y = (height - baseY - 38) * dataset[j] / barRange;
									ctx.fillRect(x - barWidth/2*options.bars, (height - 8 - baseY - 8) - y, barWidth, y);
									ctx.strokeRect(x - barWidth/2*options.bars, (height - 8 - baseY - 8) - y, barWidth, y);

									textSize = ctx.measureText(dataset[j]);
									maxW = Math.max(textSize.width, maxW);
								}
							}
						}
						break;
				}
			}
			maxW = parseInt(maxW);

			////// Popup
			var popWidth = 0, popHeight = 12 + 20, popY = 18;
			var popX = 0;
			for(var u=0; u<options.style.length; u++){
				var dataset = options[options.style[u]+"-dataset"];

				dataset = options[options.style[u]+"-names"];
				for(var v=0; v<dataset.length; v++){
					if(typeof dataset[v]=="object"){
						for(var i=0; i<dataset[v].length; i++){
							textSize = ctx.measureText(dataset[v][i]);
							popX = Math.max(parseInt(textSize.width), popX);
						}
						popHeight += dataset[v].length * 16;
					}else{
						textSize = ctx.measureText(dataset[v]);
						popX = Math.max(parseInt(textSize.width), popX);
						popHeight += dataset.length * 16;
					}
				}

				switch(options.style[u]){
					case "line":
						////// Values
						for(var i=0; i<options["line-dataset"].length; i++){
							var dataset = options["line-dataset"][i];
							for(var v=0; v<dataset.length; v++){
								if(typeof dataset[v]=="object"){
									for(var k=0; k<dataset[v].length; k++){
										textSize = ctx.measureText(yAxis(dataset[v][k]));
										popWidth = Math.max(parseInt(textSize.width), popWidth);
									}
								}else{
									textSize = ctx.measureText(yAxis(dataset[v]));
									popWidth = Math.max(parseInt(textSize.width), popWidth);
								}
							}
						}
						break;
					case "bar":
						////// Values (Lines)
						for(var i=0; i<options["bar-dataset"].length; i++){
							var dataset = options["bar-dataset"][i];
							for(var v=0; v<dataset.length; v++){
								if(typeof dataset[v]=="object"){
									for(var k=0; k<Math.min(dataset[v].length,options.bars); k++){
										textSize = ctx.measureText(yAxis(dataset[v][k]));
										popWidth = Math.max(parseInt(textSize.width), popWidth);
									}
								}else{
									textSize = ctx.measureText(yAxis(dataset[v]));
									popWidth = Math.max(parseInt(textSize.width), popWidth);
								}
							}
						}
						break;
				}
			}
			popX += 8;
			popWidth += popX + 18;

			for(var v=0; v<options.labels.length; v++){
				// current Index
				if(properties.index==v){
					ctx.fillStyle = "#FFFFFF";
					ctx.strokeStyle = "#959595";

					var x = parseInt((baseWidth * v + baseWidth / 1.5) / options.labels.length);
					x += 8 + baseOffset + 4 + 8;
					if( x+popWidth >= width-20 ) x -= parseInt(baseWidth / options.labels.length) + popWidth + 32;

					ctx.save();
						ctx.shadowColor = "rgba(0, 0, 0, 0.43)";
						ctx.shadowOffsetX = 0; 
						ctx.shadowOffsetY = 2; 
						ctx.shadowBlur = 4;

						ctx.strokeRect(x, 72, popWidth, popHeight);
					ctx.restore();
					ctx.fillRect(x, 72, popWidth, popHeight);

					ctx.fillStyle = "#383838";
					textSize = ctx.measureText(options.labels[v]);
					ctx.fillText(options.labels[v], x+parseInt(popWidth/2-textSize.width/2), 72+popY);
					popY += 20;

					for(var u=0; u<options.style.length; u++){
						switch(options.style[u]){
							case "line":
								////// Values
								for(var i=0; i<options["line-dataset"].length; i++){
									var dataset = options["line-dataset"][i];

									ctx.fillStyle = "#383838";
									ctx.fillText(options["line-names"][i], x+8, 72+popY);

									ctx.fillStyle = options["line-colors"][i];
									ctx.fillText(yAxis(dataset[v]), popX + x + 8, 72 + popY);
									popY += 16;
								}
								break;
							case "bar":
								////// Values (Lines)
								ctx.lineWidth = 0.9;
								for(var i=0; i<options["bar-dataset"].length; i++){
									var dataset = options["bar-dataset"][i];
									ctx.strokeStyle = "#727272";

									if(typeof dataset[v]=="object"){
										for(var k=0; k<Math.min(dataset[v].length,options.bars); k++){
											ctx.fillStyle = "#383838";
											ctx.fillText(options["bar-names"][i][k], x+8, 72+popY);

											ctx.fillStyle = options["bar-text-colors"][i][k];
											ctx.fillText(yBarAxis(dataset[v][k]), popX + x + 8, 72 + popY);
											popY += 16;
										}
									}else{
										ctx.fillStyle = "#383838";
										ctx.fillText(options["bar-names"][v], x+8, 72+popY);

										ctx.fillStyle = options["bar-text-colors"][v][0];
										ctx.fillText(yBarAxis(dataset[v]), popX + x + 8, 72 + popY);
										popY += 16;
									}
								}
								break;
						}
					}
				}
			}
		};
		var resizeCanvas = function(){
			var style = window.getComputedStyle(canvas.parentNode, null);
			canvas.width = parseInt(style.getPropertyValue("width"));
			renderGraph();
		};

		canvas.addEventListener("mousemove", function(e){
			var prev = properties.index;

			if(e.offsetY<properties.top){
				properties.index = -1;
			}else if(e.offsetY>=properties.bottom){
				properties.index = -1;
			}else{
				properties.index = Math.floor((e.offsetX - properties.baseX) / properties.cellWidth);
				if(properties.index<0) properties.index = -1;
				else if(properties.index>=options.labels.length) properties.index = -1;
			}
			if(prev != properties.index) renderGraph();
		});
		canvas.addEventListener("mouseleave", function(e){
			properties.index = -1;
			renderGraph();
		});

		window.addEventListener("resize", resizeCanvas);
		resizeCanvas();
	};
}()