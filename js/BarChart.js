/** 
* Jedox Bar chart 
*
* obj
	({
		svg: svg,
		width: width,
		height: height,
		name: "Bar Chart",
		padding: 50,
		rangeBandsInnerPadding: .1,
		rangeBandsOuterPadding: .6,
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
function BarChart(obj) 
{
	/** Global chart object, contains whole chart */
	var chart = obj.svg.append("g").attr("id", obj.name);
	/** Data bars */
	var bars;
	/** barWidth calculates the width of a data bar (@bars) depending on obj.width, obj.rangeBandsInnerPadding and obj.rangeBandsOuterPadding and the number of data elements(=number of bars)*/
	var barWidth=(obj.width-((obj.data.length-1)*obj.rangeBandsInnerPadding+2*obj.rangeBandsOuterPadding))/obj.data.length;
	/** Overlay for @bars for hover or click events */
	var barsOverlay
	/** Overlay opacity value for @barsOverlay */
	var barsOverlayOpacity = 0.5;
	/** min max X for Scales */
	var xMin, xMax;	// x range
	/** min max Y for Scales */
	var yMin, yMax; // y range
	/** Scale objects */
	var xScale, yScale;
	/** Axis groups */
	var x,y;
	/** Custom x axis line. Used for transition */
	var xLine;
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
		var dataArray=data.map(function(d){return d.y;});
		bars.data(dataArray).enter();
		barsOverlay.data(dataArray).enter();
		dataLabels=dataArray;
		
		// transition time - if undeclared take default time
		var defaultTransitionTime = 500;
		var transitionTime = (!obj.transitionDuration) ? 
			defaultTransitionTime : obj.transitionDuration;
		
		// data bars transition
		bars
			.transition()
			.duration(transitionTime)
			.attr("y",function(d){
				return (d>=0) ? yScale(d) : yScale(0);
			})				
			.attr("width", function(d,i) {
				return xScale.rangeBand();
			})				
			.attr("fill", function(d,i) { 
				return (d>=0) ? colorPositive : colorNegative; 
			})
			.attr("height", function(d){return Math.abs(yScale(0)-yScale(d));});	
		
		// bars overlay transition
		barsOverlay
			.attr("width", function(d,i) {
				return xScale.rangeBand();
			})			
			.attr("y",function(d){
				return yScale(yMax);
			})	
			.attr("height", function(d){
				return Math.abs(yScale(yMax)-yScale(yMin));
			});
		
		// create data label for each bar. they are only displayed when hovered (see mouseover/-out @barsOverlay)
		for(var i=0; i<dataLabels.length; i++) 
		{
			var tmpX=$("#bar"+i).attr("x");
			var fontSize=$(".dataLabels").css("font-size"); // get font size from css
			var text=dataLabels[i].toFixed(1);
			
			dataLabelsGroup.append("text")
				.text(text)
				.attr("id", "dataLabel"+i)
				.attr("x", Number(tmpX)-(text.length/2))
				.attr("y", yScale(yMax)+Number(fontSize.replace("px","")))
				.attr("opacity", (i==selected) ? 1 : 0);
		}
		
		// x axis line transition
		xLine
			.transition()
			.duration(transitionTime)
			.attr("y1", yScale(0))
			.attr("y2", yScale(0));			
	} //transition
	
	/** 
	* Update data PUBLIC
	* Checks if number of bars remains and then calls transitions
	* otherwise it redraws whole chart.
	*/	
	this.update = function(data) {
		if(data.length!=previousDataLength) {
			chart.selectAll("rect").remove();
			d3.select("#xAxis").remove();
			y.remove();
			init(data);
		}
		else transition(data);
	} //update
	
	/**
	* Set Title PUBLIC
	*/
	this.setTitle = function(text) {
		title.text(text).attr("x", obj.width/2-text.length);
	} //setTitle
	
	/**
	* Prepares scales and axis before drawing
	*/
	var initScalesAndAxes = function(data) {
		lastestData=data;
		
		chart.selectAll("g").remove(); // clear labels - they will be redrawn
		
		/* SCALES */
		// X
		xMin=Math.min.apply(Math, data.map(function(d){return d.x;}));
		xMax=Math.max.apply(Math, data.map(function(d){return d.x;}));			
		xScale = d3.scale.ordinal()
					.domain(data.map(function(d){return d.label;}))
					.rangeRoundBands([0, obj.width], obj.rangeBandsInnerPadding, obj.rangeBandsOuterPadding);
		// Y
		yMin=Math.min.apply(Math, data.map(function(d){return d.y;}));
		yMax=Math.max.apply(Math, data.map(function(d){return d.y;}));
		yScale = d3.scale.linear()
					.domain([yMin, yMax])
					.range([obj.height - obj.padding,obj.padding]);
				
		/* AXIS */
		// X
		xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom");
					
		x = chart.append("g")
			.attr("id","xAxis")
			.attr("class","x axis")
			.attr("transform", "translate(0," + (obj.height - obj.padding) + ")")
			.call(xAxis);				
		
		// Y
		//draw y axis
		var tickCnt=(yMax-yMin)/5;
			if(tickCnt>5)
				tickCnt= 5;	
				
		yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(tickCnt);
		y = chart.append("g")
				.attr("class","y axis")
				.attr("transform", "translate(" + obj.padding + ",0)")
				.call(yAxis);
				
		//Create group for data labels above the bars	
		dataLabelsGroup=chart.append("g")
			.attr("class", "dataLabels");
			
	} //initScalesAndAxes
	
	/**
	* Initializes chart
	* @data initial data
	*/
	this.init = function(data) {
		initScalesAndAxes(data);
		
		title = chart.append("text").attr("class", "title")
			.attr("x", obj.width/2)
			.attr("y", obj.padding/2);
		this.setTitle("Working Capital");
		
		// x axis label (Volume)
		chart.append("text").attr("class","axis label")
					.attr("x",obj.width/2)
					.attr("y", obj.height)
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
		
		//initial bars (invisible)
		bars=chart.selectAll("rect")
			.data(data.map(function(d){return d.x;}))
			.enter().append("rect")
			.attr("class","bar")
			.attr("id", function(d,i) {return "bar"+i;})
			.attr("x", function(d,i) {
				return xScale(i);
			})
			.attr("y",yScale(0))
			.attr("width", 0)
			.attr("height", 0);
		
		//initial overlay bars
		barsOverlay=chart.selectAll().append("rect")
			.data(data.map(function(d){return d.x;}))
			.enter().append("rect")
			.attr("class","barsOverlay")
			.attr("id", function(d,i) {return "barsOverlay"+i;})
			.attr("x", function(d,i) {
				return xScale(i);
			})
			.attr("y",yScale(0))
			.attr("width", 0)
			.attr("height", 0)
			.attr("opacity", 0)
			.on("mouseover", function(d,i) {
				if(i!=selected) {
					d3.select(this).attr("opacity", barsOverlayOpacity);
					d3.select("#dataLabel"+i).attr("opacity",1);
				}
			})
			.on("mouseout", function(d,i) {
				if(i!=selected) {
					d3.select(this).attr("opacity", 0);
					d3.select("#dataLabel"+i).attr("opacity",0);
				}
			})
			.on("click", function(d,i) {barClick(d,i);});		
		
		//custom x axis
		xLine = chart.append("line")
			.attr("class", "xLine")
			.attr("x1", obj.padding)
			.attr("y1", yScale(0))
			.attr("x2", obj.width-obj.padding)
			.attr("y2", yScale(0));
		
		//call transitions to draw bars etc.
		transition(data);
		previousDataLength=data.length;
	} //init
	
	/** Click event for barsOverlay */
	var barClick = function(data,idx) {
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
		d3.select("#barsOverlay"+idx).attr("class", "barsOverlaySelected");	
	}
	
	/** Deselect selected bar */
	var deselectBar = function(idx) {
		selected=-1;
		d3.select("#barsOverlay"+idx).attr("class", "barsOverlay");		
	}
	
	/** Deselect selected bar and select bar with index idx*/
	var reselectBar = function(idx) {
		//NOTE: when deselecting a bar which is not the current, 
		//opacity values have to be set explicitely because they inherit it
		//from the former class, which of course intransparent due to former selection	
		d3.select("#barsOverlay"+selected).attr("class", "barsOverlay");	
		d3.select("#barsOverlay"+selected).attr("opacity", 0); //explicit
		d3.select("#dataLabel"+selected).attr("opacity",0);	//explicit					
		//and select this
		selectBar(idx);	
	}
	
	/**
	* Constructor
	*/
	this.init(obj.data); // First run only
};	//BarChart