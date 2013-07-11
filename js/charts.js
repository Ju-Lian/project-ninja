/** Simple bar chart 
* obj
	({
		svg: svg,
		width: width,
		height: height,
		name: "Bar Chart",
		padding: 50,
		rangeBandsInnerPadding: .1,
		rangeBandsOuterPadding: .6,
		data: data
	});
*/
function BarChart(obj) {
	var chart=null;

	/** axis */
	var xAxis=null;
	var xAxisTicks=null;
	var yAxis=null;
	var yAxisTicks=null;
	/** bars */
	var color="rgb(24,116,205)";
	var bars=null; // data rects !
	var barWidth= 40;
	var bar_padding = 10; // distance between bars (e.g. months and BS positions, ticks on x axis of change chart)
	var valLabels = null; // displays value for each bar
	/** scaling */
	var minX=0;
	var maxX=(periods.length-2)*bar_padding;	
	var maxY=100;//Initial maxY and minY
	var minY=-100;
	var xScale = null;
	var yScale = null;
	/** hover and click */
	var hovered=-1; // hovered bar
	var selected=-1; // selected bar
	var frozen=false; // if a bar is selected, freeze the chart - select bar again to unfreeze
	/** data */
	var prevDataset=[];
	var dataset=[];
	
	/** Scales y values */
	this.getYScale=function(value) {return yScale(value);};
	/** Scales y values */
	this.getXScale=function(value) {return xScale(value);};
	/** Returns index of hovered bar */
	this.getHovered=function() {return hovered;};
	/** Get selected month */
	this.getSelected=function() {return selected;};
	/** Set selected month */
	this.setSelected=function(sel) {selected=sel;};
	
	/** Init datasets */
	this.initData = function() {
	
	};
	
	/**
	* Initialize chart. Create all elements and draw
	* axis.
	*/
	this.initialize = function(initTitle, initW, initH) {
		console.log("initilize simple bar chart");
		
		//chart size
		width=initW;
		height=initH;
		
		//Create SVG element
		chart = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			.style("border", "1px solid lightgrey")
			.style("padding", "10px")
			.style("box-shadow", "0 0 5px 2px lightgrey");
		
		chart.attr("id","changeChart");
		
		//Define scales
		xScale = d3.scale.linear()
					 .domain([minX, maxX])
					 .range([padding, width - padding]);
		yScale = d3.scale.linear()
					 .domain([minY, maxY])
					 .range([height - padding, padding]);

		//Draw initial chart
		bars=chart.selectAll()
			.data(dataset)
			.enter()
			.append("rect")
			.attr("class","changeBar")
			.attr("x", function(d,i) { 
				return xScale((i+1)*bar_padding)-(barWidth/2); 
			})
			.attr("y", yScale(0))
			.attr("width", barWidth)
			.attr("height", 0) // initial height
			.attr("fill",colorFill)
			.on("mouseover", function(d,i){
				if(!frozen)
				{
					hoverMonth(i);
					d3.select(this).attr("fill", colorHover);
				}
			})
			.on("mouseout", function(d,i){
				if(!frozen)
				{
					hoverOutMonth();
					
					d3.select(this)
						.attr("fill", function(d,i){
							if(d>=0) return colorFill;
							else return colorNegative;
						});	
				}
			})
			.on("click", function(d,i) {
				if(selected==-1) {			
					selectMonth(i);
				}
				else if(frozen && i==selected) {
					deselect();
				}
			});
		
		//value of each bar
		valLabels=chart.selectAll()
			.data(dataset)
			.enter()				
			.append("text")
			.text("")
			.attr("x",function(d,i) {
				return xScale((i+1)*bar_padding);
			})
			.attr("y",function(d){return yScale(d+1);})
			.attr("class", "dataLabelsChangeChart");
		
		//ticks
		xAxisTicks=chart.selectAll()
			.data(periods)
			.enter()
			.append("text")
			.text(function(d,i) { return periods[i]; })
			.attr("x",function(d,i) {
				return xScale(i*bar_padding);
			})
			.attr("y",yScale(minY)+padding-(padding/3-8)) //numbers based on manual attempts
			.attr("class","dataLabelsChangeChart")
			.on("mouseover", function(d,i) {
				if(!frozen)
				{
					hoverMonth(i-1);
					d3.select(this).attr("fill", colorFill);
				}
			})
			.on("mouseout", function(d, i) {
				if(!frozen)
				{
					hoverOutMonth();
					d3.select(this).attr("fill", "black");					
				}
			})
			.on("click", function(d,i) {
				//NOTE: periods array contains an empty first and last element, 
				//therefore the first month Jan has the index 1.
				//To get the correct month calculate i-1
				if(selected==-1) {
					selectMonth(i-1);
				}
				else if(selected==i-1 && frozen){
					deselect();
				}
			});

		//X axis
		xAxis = chart.append("line")
		  .attr("x1", xScale(minX))
		  .attr("y1", yScale(0))
		  .attr("x2", xScale(maxX)+barWidth)
		  .attr("y2", yScale(0))
		  .attr("class","myAxisLine");
			
		//Y axis
		var tickCnt=(maxY-minY)/5;
		if(tickCnt>5)
			tickCnt= 5;	
			
		var yAxis = d3.svg.axis()
		  .scale(yScale)
		  .orient("left")
		  .ticks(tickCnt);
		  
		//Y axis
		chart.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + padding + ",0)")
			.call(yAxis);
			
		//Title
		chart.append("text")
			.text("Change in Working Capital")
			.attr("x",width/2)
			.attr("y",11)
			.attr("class","chartTitle");
	};
	
	/**
	* Redraw WC change chart.
	*/
	this.redraw = function() {
		prevDataset=dataset
		dataset=datasets[0]; //update dataset
		
		minY = Math.min.apply(Math, dataset);
		maxY = Math.max.apply(Math, dataset);
		minY = (minY > -50) ? -50 : minY-(minY%5);
		maxY = (maxY < 50) ? 50 : maxY+(5-maxY%5);
		
		//Define scales
		xScale = d3.scale.linear()
					 .domain([minX, maxX])
					 .range([padding, width - padding]);

		yScale = d3.scale.linear()
					 .domain([minY, maxY])
					 .range([height - padding, padding]);  
		
		//redraw bars
		bars.data(dataset)
			.transition()
			.duration(800)
			.attr("fill", function(d,i){
				
					if(d>=0) return colorFill;
					else return colorNegative;
				
			})
			.attr("y", function(d, i) {
				if(signChange(prevDataset[i], d)) {
					return yScale(0);
				}
				else {
					return (d>=0) ? yScale(d) : yScale(0);
				}
			})
			.attr("height", function(d, i) { 
				if(signChange(prevDataset[i], d))
					return 0;
				else {
					return Math.abs(yScale(0)-yScale(d)); 
				}
			})
			.each("end", endChangeRectY);	
		
		//value of each bar
		valLabels.data(dataset)
			.transition()
			.duration(800)
			.text(function(d){return d.toFixed(2).toString()})
			.attr("y", function(d) {
				return yScale(d) + ((d>=0) ? -6 : 16);
			});
			
		//redraw x axis
		xAxis.transition()
			.duration(800)
			.attr("y1", yScale(0))
			.attr("y2", yScale(0));

		//redraw Y axis
		chart.selectAll("axis").remove();
		chart.selectAll("g").remove();

		//Y axis
		var tickCnt=(maxY-minY)/5;
		if(tickCnt>5)
			tickCnt=5;	
		var yAxis = d3.svg.axis()
		  .scale(yScale)
		  .orient("left")
		  .ticks(tickCnt);

		chart.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + padding + ",0)")
			.call(yAxis);		
	};
	
	/** Function handles click event when selecting a month (click on bar or month name)*/
	function selectMonth(idx) {
		selected=idx;
		frozen=true;
		//month labels on xAxis
		d3.selectAll("#changeChart text")
		.filter(function(d) {
			return d==periods[idx+1];
		})
		.attr("fill", colorSelected);
		//data bars
		d3.selectAll("#changeChart rect")
		.filter(function(d,i) {
			return i==idx;
		})
		.attr("fill", colorSelected);			
	}
	
	/** Reset selection variables and reset change chart to default colors */
	function deselect() {
		console.log("deselect");
		selected=-1;
		frozen=false;	
		xAxisTicks.attr("fill", "black");
		d3.selectAll("#changeChart rect").attr("fill", function(d,i){
			if(d>=0) return colorFill;
			else return colorNegative;
		});
	}
	
	/** Function handles hover events */
	function hoverMonth(idx) {
		hovered=idx; //select hovered
		//Redraw detail charts
		if(hovered>-1)
		{
			dc1.setTotalChange(dataset[hovered]);
			dc1.redraw(hovered);
			dc2.setTotal(dataset[hovered]);
			dc2.redraw(hovered);							
		}				
	}
	
	/** Handles mouseout event */
	function hoverOutMonth() {
		hovered=-1;
		dc1.disable();
		dc2.disable();		
	}
	
	/**
	* Function is called after first transition
	* of Change bars. This is necessary to redraw bars
	* that have change their algebraic signs.
	*/
	function endChangeRectY(d) {
		d3.select(this)
			.transition()
			.duration(500)
			.attr("y", (d>=0) ? yScale(d) : yScale(0))
			.attr("height", Math.abs(yScale(0)-yScale(d)));
	}		
};