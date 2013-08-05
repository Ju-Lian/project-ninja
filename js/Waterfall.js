/** 
* Jedox Bar chart 
*
* obj
	({
		svg: svg,
		width: width,
		height: height,
		name: String,
		title: String, // default is name
		padding: 50,
		rangeBandsInnerPadding: [0-1] float,
		rangeBandsOuterPadding: Number,
		rangeBandsTopPadding: Number,
		transitionDuration: Number [optional]
		eventListener: Object for Eventhandling
		xAxisLabel: String
		yAxisLabel: String
		data: 
		{
			label: String
			x: Number
			y: Number
		}
	});
*/
function Waterfall(obj) 
{
	/** Global chart object, contains whole chart */
	var chart = obj.svg.append("g").attr("id", obj.name);
	/** Data bars */
	var bars;
	var objData;
	/** Overlay for @bars for hover or click events */
	var barsOverlay
	/** Overlay opacity value for @barsOverlay */
	var barsOverlayOpacity = 0.5;
	/** min max X for Scales - see calculation @initScalesAndAxes */
	var xMin, xMax;	// x range
	/** min max Y for Scales */
	var yMin, yMax; // y range
	/** Scale objects */
	var xScale, yScale;
	/** Axis groups */
	var x,y;
	/** Custom y axis line. Used for transition */
	var yLine;
	/** Helper lines to connect the data bars */
	var connectingLines;
	/** Chart title object */
	var title=obj.name;
	/** Stores the data count, essential to check if an update contains more values */
	var previousDataLength;
	/** Stores the most recently used data object */
	var latestData;
	/** Selected data bar index */
	var selected = -1;
	/** Groups all data labels */
	var dataLabelsGroup;
	/** data labels for each data bar */
	var dataLabels=new Array();
	
	/** get color from css - this is only possible if an element of the class exists */
	$(document.createElement("div")).addClass("barNegative").hide().appendTo($("body"));
	$(document.createElement("div")).addClass("barPositive").hide().appendTo($("body"));
	var colorPositive = $(".barPositive").css("fill");
	var colorNegative = $(".barNegative").css("fill");	
	
	/** Set selected value PUBLIC */
	this.setSelected = function(idx) {
		selected=idx;
	}//setSelected	
	
	/** Get selected value PUBLIC */
	this.getSelected = function() {
		return selected;
	}//getSelected
	
	/**
	* Draw transitions
	*/
	var transition = function(data) {
		initScalesAndAxes(data);
		
		// new data
		var dataset=data.map(function(d){return d.x;});
		bars.data(dataset).enter();
		barsOverlay.data(dataset).enter();
		dataLabels=dataset;
		
		// transition time - if undeclared take default time
		var defaultTransitionTime = 500;
		var transitionTime = (!obj.transitionDuration) ? 
			defaultTransitionTime : obj.transitionDuration;
		
		connectingLines.selectAll("line").attr("opacity", 0);
		
		// data bars transition
		var fontSize=Number($(".dataLabels").css("font-size").replace("px",""));
		dataLabelsGroup.selectAll("text").attr("opacity", 0);
		var lastX=0;
		bars
			.transition()
			.duration(transitionTime)
			.attr("x", function(d,i) {
				if(i<dataset.length-1)
				{
					//BS position bars
					var tmp=0;
					if(d>=0)
					{
						tmp=lastX;
						lastX+=d;
					}
					else if(d<0)
					{						
						lastX+=d;
						tmp=lastX;
					}
					return xScale(tmp);
				}
				else {
					//total change bar
					if(d>=0) return xScale(0)
					else return xScale(d);
				}
			})					
			.attr("width", function(d) {
				var w=Math.abs(xScale(d)-xScale(0));
				//if width w is too small, fix its width to make it visible
				return (w>=1) ? w : 1;
			})
			.attr("height", function(d){
				return yScale.rangeBand();
			})
			.attr("fill", function(d,i) { 
				return (d>=0) ? colorPositive : colorNegative; 
			})
			.each("end", function(d,i) {
				//connecting Lines
				if(i<dataset.length-1) {
					var tmpX = (d>=0) ?
						 Number(d3.select("#"+obj.name+"_bar"+i).attr("x")) + Number(d3.select("#"+obj.name+"_bar"+i).attr("width"))
						: Number(d3.select("#"+obj.name+"_bar"+i).attr("x"));	
						
					d3.select("#"+obj.name+"_connectingLine"+i)
						.attr("x1", tmpX)
						.attr("x2", tmpX)
						.attr("opacity", 1);	
				}
				//data labels
				d3.select("#"+obj.name+"_dataLabel"+i)
					.text(d.toFixed(1))
					.attr("x", (d>=0) ? 
						Number(d3.select(this).attr("x")) + Number(d3.select(this).attr("width")) + 2
						: d3.select(this).attr("x") - (d.toFixed(1).toString().length*fontSize/2)
					)
					.attr("opacity", 1);					
			});
		
		// y axis line transition
		yLine
			.transition()
			.duration(transitionTime)
			.attr("x1", xScale(0))
			.attr("x2", xScale(0));		
	} //transition
	
	/** 
	* Update data PUBLIC
	* Checks if number of bars remains and then calls transitions
	* otherwise it redraws whole chart.
	*/	
	this.update = function(data) {
		//previousDataLength-1 necessary because @init added the {Total ...} to current data
		if(data.length!=previousDataLength) {
			d3.select("#"+obj.name).remove(); //remove all drawn objects
			init(data); //reinitialize
		}
		else {
			initObjData(data);
			transition(objData);
		}
	} //update
	
	/**
	* Set Title PUBLIC
	*/
	this.setTitle = function(text) {
		title.text(text).attr("x", obj.width/2-text.length*4); // 4=magic number to shift title from real center to visual center
	} //setTitle
	
	/**
	* Prepares scales and axis before drawing
	*/
	var initScalesAndAxes = function(data) {
		removeAxis(); // clear axis - they will be redrawn
		
		/* SCALES */
		// X
		//Get highest and lowest partial result
		//in order to calculate width for xScale
		xMax=0;
		xMin=0;
		var tmp=0;
		var dataset=data.map(function(d){return d.x;});
		//loop condition: dataset.length-1 because Total value is ignored
		for(var i=0; i<dataset.length-1; i++) {
			tmp+=dataset[i];
			if(tmp>xMax)
				xMax=tmp;
			else if(tmp<xMin)
				xMin=tmp;
		}				
		xScale = d3.scale.linear()
					.domain([xMin, xMax])
					.range(
					[
					obj.padding+obj.rangeBandsOuterPadding+obj.rangeBandsTopPadding,
					obj.width-obj.padding-obj.rangeBandsOuterPadding-obj.rangeBandsTopPadding
					]);		
		// Y
		yMin=Math.min.apply(Math, data.map(function(d){return d.y;}));
		yMax=Math.max.apply(Math, data.map(function(d){return d.y;}));
		yScale = d3.scale.ordinal()
					.domain(data.map(function(d){return d.label;}))
					.rangeRoundBands([0, obj.height], obj.rangeBandsInnerPadding, obj.rangeBandsOuterPadding);
			
		/* AXIS */
		// X
		xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(1);
		
		
		x = chart.append("g")
			.attr("id","xAxis")
			.attr("class","x axis")
			.attr("transform", "translate(0," + (obj.height - obj.padding) + ")")
			.call(xAxis);				
		x.attr("display","none"); // hide x axis
		
		// Y				
		yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left");
		y = chart.append("g")
				.attr("class","y waterfall axis")
				.attr("transform", "translate(" + obj.padding + ",0)")
				.call(yAxis);
	}//initScalesAndAxes
	
	/**
	* Remove x and y axis
	*/
	var removeAxis = function() {
		if(!x || !y) {
			console.warn("removeAxis(): axis undefined");
			return;
		}
		x.remove();
		y.remove();
	}//removeAxis
	
	/** 
	* Initializes working copy of data object 
	* and adds total value of all x values.
	*/
	var initObjData = function(data) {
		objData={};
		objData=data.slice(0);
		//calculate total of all y values
		objData.push({label: "Total", x: d3.sum(data.map(function(d){return d.x;})), y:data.length*10+10} );		
	}//initObjData
	
	/**
	* Initializes chart
	* @data initial data
	*/
	this.init = function(data) {
		initObjData(data); // use objData afterwards
		initScalesAndAxes(objData);
		
		title = chart.append("text").attr("class", "title")
			.attr("x", obj.width/2)
			.attr("y", obj.padding/2);
		this.setTitle( (!obj.title) ? obj.name : obj.title);
		
		// x axis label
		chart.append("text").attr("class","axis label")
					.attr("x",obj.width/2)
					.attr("y", obj.height-15)
					.style("text-anchor", "middle")					  
					.text(obj.xAxisLabel);		
		
		// y axis label
		chart.append("text").attr("class","axis label")
					.attr("x",-obj.height/2)
					.attr("y", ".7em")
					.style("text-anchor", "middle")
					.attr("transform", function(d) {
						return "rotate(-90)" 
					})						  
					.text(obj.yAxisLabel);		
		
		//custom y axis
		yLine = chart.append("line")
			.attr("class", "customAxisLine")
			.attr("x1", xScale(0))
			.attr("y1", yScale(0))
			.attr("x2", xScale(0))
			.attr("y2", obj.height-yScale(0));		
		
		//initial bars (invisible)
		bars=chart.selectAll("rect")
			.data(objData.map(function(d){return d.y;}))
			.enter().append("rect")
			.attr("class","bar")
			.attr("id", function(d,i) {return obj.name+"_bar"+i;})
			.attr("x",xScale(0))
			.attr("y", function(d,i) {
				return yScale(i);
			})
			.attr("width", 0)
			.attr("height", 0);
		//Connecting lines between data bars
		connectingLines = chart.append("g").attr("class", "connectingLine");				
		var dataset=objData.map(function(d){return d.x;});
		for(var i=0; i<dataset.length-1; i++) 
		{
			connectingLines.append("line")
				.attr("id", function() {return obj.name+"_connectingLine"+i;})
				.attr("x1", function(d) {
					if(d>=0) 
					{
						return Number(d3.select("#"+obj.name+"_bar"+i).attr("x")) + Number(d3.select("#"+obj.name+"_bar"+i).attr("width"));
					}
					else return Number(d3.select("#"+obj.name+"_bar"+i).attr("x"));
				})
				.attr("y1", function() {
					return Number(d3.select("#"+obj.name+"_bar"+i).attr("y")) + yScale.rangeBand(); 
				})
				.attr("x2", function(d) { 
					if(d>=0) return Number(d3.select("#"+obj.name+"_bar"+i).attr("x")) + Number(d3.select("#"+obj.name+"_bar"+i).attr("width"));
					else return Number(d3.select("#"+obj.name+"_bar"+i).attr("x"));			
				})
				.attr("y2", function() {
					return d3.select("#"+obj.name+"_bar"+(i+1)).attr("y"); 
				});
		}//for loop connectingLines
		
		//initial overlay bars
		barsOverlay=chart.selectAll()
			.data(objData.map(function(d){return d.x;}))
			.enter().append("rect")
			.attr("class","barsOverlay")
			.attr("id", function(d,i) {return obj.name+"_barsOverlay"+i;})
			.attr("x", function(d,i) {
				return xScale(xMin);
			})
			.attr("y", function(d,i) {return yScale(i);})
			.attr("width", xScale(xMax)-xScale(xMin))
			.attr("height", yScale.rangeBand())
			.attr("opacity", 0)
			.on("mouseover", function(d,i) {
				if(i!=selected) {
					d3.select(this).attr("opacity", barsOverlayOpacity);
				}
			})
			.on("mouseout", function(d,i) {
				if(i!=selected) {
					d3.select(this).attr("opacity", 0);
				}
			})
			.on("click", function(d,i) {barClick(i);});					
		
		//Create group for data labels above the bars	
		dataLabelsGroup=chart.append("g")
			.attr("id" , "dataLabelsGroup")
			.attr("class", "dataLabels");		
		var fontSize=Number($(".dataLabels").css("font-size").replace("px","")); //get fontSize from css
		for(var i = 0; i<objData.length; i++) 
		{
			dataLabelsGroup.append("text")	
				.text("NaN")
				.attr("id", function() {return obj.name+"_dataLabel"+i;})
				.attr("x", xScale(0))
				.attr("y", Number(d3.select("#"+obj.name+"_bar"+i).attr("y")) + yScale.rangeBand()/2 + fontSize/2);
		}		
		
		//call transitions to draw bars etc.
		transition(objData);
		previousDataLength=data.length; //IMPORTANT: must not use objData.length here, because it contains an additional Total element
	} //init
	
	/** Click event for barsOverlay */
	var barClick = function(idx) {
		if(selected==-1) {
			//select this
			selectBar(idx);
		}
		else if(selected!=-1) {
			if(selected==idx) {
				//deselect this
				deselectBar(idx);
			}
			else {
				//deselect current selection - which is not this bar
				reselectBar(idx);
			}
		}	
		obj.eventListener.fire(obj.name+"."+"click"); // fire event!!!
	}
	
	/** Select hovered bar */
	var selectBar = function(idx) {
		selected=idx;
		d3.select("#"+obj.name+"_barsOverlay"+idx).attr("class", "barsOverlaySelected");	
	}
	
	/** Deselect selected bar */
	var deselectBar = function(idx) {
		selected=-1;
		d3.select("#"+obj.name+"_barsOverlay"+idx).attr("class", "barsOverlay");		
	}
	
	/** Deselect selected bar and select bar with index idx*/
	var reselectBar = function(idx) {
		//NOTE: when deselecting a bar which is not the current, 
		//opacity values have to be set explicitely because they inherit it
		//from the former class, which of course intransparent due to former selection	
		d3.select("#"+obj.name+"_barsOverlay"+selected).attr("class", "barsOverlay");	
		d3.select("#"+obj.name+"_barsOverlay"+selected).attr("opacity", 0); //explicit
		//and select this
		selectBar(idx);	
	}
	
	/**
	* Constructor
	*/
	this.init(obj.data); // First run only
};//Waterfall