/** 
* Jedox Bar chart 
*
* obj
	({
		svg: svg,
		width: width,
		height: height,
		name: String,
		title: String //default is name
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
function BarChart(obj) 
{
	/** Global chart object, contains whole chart */
	var chart = obj.svg.append("g").attr("id", obj.name);
	/** Data bars */
	var bars;
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
		var dataArray=data.map(function(d){return d.y;});
		bars.data(dataArray).enter();
		barsOverlay.data(dataArray).enter();
		
		// transition time - if undeclared take default time
		var defaultTransitionTime = 500;
		var transitionTime = (!obj.transitionDuration) ? 
			defaultTransitionTime : obj.transitionDuration;
		
		// data bars transition
		var fontSize=Number($(".dataLabels").css("font-size").replace("px",""));
		dataLabelsGroup.selectAll("text").attr("opacity", 0);
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
			.attr("height", function(d){return Math.abs(yScale(0)-yScale(d));})
			.each("end", function(d,i) {
				d3.select("#"+obj.name+"_dataLabel"+i)
					.text(d.toFixed(1))
					.attr("x", d3.select(this).attr("x") - (d.toFixed(1).toString().length)/2)
					.attr("y", (d>=0) ? 
						Number(d3.select(this).attr("y")) - 2 
						: Number(d3.select(this).attr("y")) + Number(d3.select(this).attr("height")) + fontSize)
					.attr("opacity", 1);					
			});	
		
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
			d3.select("#"+obj.name).remove(); //remove all drawn objects
			init(data);
		}
		else transition(data);
	} //update
	
	/**
	* Set Title PUBLIC
	*/
	this.setTitle = function(text) {
		title.text(text).attr("x", obj.width/2-text.length*4); // magic number: 4 to shift title from real center to visual center
	} //setTitle
	
	/**
	* Prepares scales and axis before drawing
	*/
	var initScalesAndAxes = function(data) {
		removeAxis(); // clear labels - they will be redrawn
		
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
					.range([obj.height - obj.padding - obj.rangeBandsTopPadding, obj.padding+obj.rangeBandsTopPadding]);
				
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
	} //initScalesAndAxes
	
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
	* Initializes chart
	* @data initial data
	*/
	this.init = function(data) {
		initScalesAndAxes(data);
		
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
		
		//initial bars (invisible)
		bars=chart.selectAll("rect")
			.data(data.map(function(d){return d.x;}))
			.enter().append("rect")
			.attr("class","bar")
			.attr("id", function(d,i) {return obj.name+"_bar"+i;})
			.attr("x", function(d,i) {
				return xScale(i);
			})
			.attr("y",yScale(0))
			.attr("width", 0)
			.attr("height", 0);
		
		//initial overlay bars
		barsOverlay=chart.selectAll()
			.data(data.map(function(d){return d.x;}))
			.enter().append("rect")
			.attr("class","barsOverlay")
			.attr("id", function(d,i) {return obj.name+"_barsOverlay"+i;})
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
				}
			})
			.on("mouseout", function(d,i) {
				if(i!=selected) {
					d3.select(this).attr("opacity", 0);
				}
			})
			.on("click", function(d,i) {barClick(i);});		
		
		//custom x axis
		xLine = chart.append("line")
			.attr("class", "customAxisLine")
			.attr("x1", obj.padding)
			.attr("y1", yScale(0))
			.attr("x2", obj.width-obj.padding)
			.attr("y2", yScale(0));
		
		//Create group for data labels above the bars	
		dataLabelsGroup = chart.append("g")
			.attr("id" , "dataLabelsGroup")
			.attr("class", "dataLabels");		
		for(var i = 0; i<data.length; i++) {
			dataLabelsGroup.append("text")	
				.text("NaN")
				.attr("id", function() {return obj.name+"_dataLabel"+i;})
				.attr("x", Number(d3.select("#"+obj.name+"_bar"+i).attr("x")))
				.attr("y", yScale(0));
		}
		
		//call transitions to draw bars etc.
		transition(data);
		previousDataLength=data.length;
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
};	//BarChart