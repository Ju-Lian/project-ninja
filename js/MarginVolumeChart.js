/** 
* Chart with margin and volume data for differenct products.
*
* Data structure obj
*	svg: svg Object,
*	width: positive Number,
*	height: positive Number,
*	name: String,
*	padding: positive Number,
*	rangeBandsInnerPadding: floating Number, //padding between bars
*	rangeBandsOuterPadding: floating Number, //padding between bars and axis
*	sortbyVolume: Boolean,
*	showGridLines: Boolean,
*	data: 
*		{
*			product: String,
*			margin: positive Number,
*			volume: positive Number
*		}
*
* Axis
*	y-Axis --> Margin
*	x-Axis --> Volume
*	(IMPORTANT: Margin and Volume values must be greater or equal 0)
*/
function MarginVolumeBars(obj) 
{
	var chart = obj.svg.append("g").attr("id", obj.name);
	var bars;
	var xMin, xMax;	// x range
	var yMin, yMax; // y range
	var xScale, yScale; // scales
	var x,y; // axis groups
	var volumes;
	var maxVolume;
	var barWidths;	
	var previousDataLength;
	
	/**
	* Draw transitions
	*/
	var transition = function(data) {
		beforeDrawing(data);
		
		bars.data(data.map(function(d){return d.margin;})).enter();
		
		bars
			.transition()
			.duration(500)
			.attr("x", function(d,i) {
				return xScale(i)+((xScale.rangeBand()-barWidths[i])/2);
			})
			.attr("y",function(d){
				return yScale(d);
			})				
			.attr("width", function(d,i) {
				return barWidths[i];
			})				
			.attr("height", function(d){return Math.abs(yScale(0)-yScale(d));});		
	} //transition
	
	/** Update data - transition
	* Note: Make sure, that all values are positive!
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
	* Prepare scales, axis etc. before drawing
	*/
	var beforeDrawing = function(data) {
		chart.selectAll("g").remove(); // to clear labels
		//Sort data
		if(obj.sortByVolume) {
			data.sort(function sortByVolume(x,y) {
				return x.volume-y.volume;
			});
		}		
		
		/* SCALES */
		// X
		xMin=0;
		xMax=function() 
		{
			var sumVolume=0;
			for(var d in data) {
				sumVolume+=data[d].volume; //Compute sum of all volumes as xMax value
			}
			return sumVolume;		
		};
		var productNames = new Array(); // Product names x Axis
		for(var p in data) {
			productNames.push(data[p].product+" "+data[p].volume); //extract each product name
		}				
		xScale = d3.scale.ordinal()
					.domain(productNames)
					.rangeRoundBands([0, obj.width], obj.rangeBandsInnerPadding, obj.rangeBandsOuterPadding);
		// Y
		yMin=0;
		yMax=Math.max.apply(Math, data.map(function(d){return d.margin;}));
		yScale = d3.scale.linear()
					.domain([yMin, yMax])
					.range([obj.height - obj.padding,obj.padding]);
		
		/* GRID LINES */
		if(obj.showGridLines) {
			var lineCnt=6; //number of grid lines
			var linePadding=yMax/lineCnt; //padding between each grid line
			var gridLines=new Array();
				for(var i=0; i<lineCnt; i++) {
					gridLines.push(yMax-linePadding*i);
				}	
			var grid=chart.append("g").attr("class","grid");

			grid.selectAll()
				.data(gridLines)
				.enter()
				.append("line")
				.attr("class","gridLine")
				.attr("x1",obj.padding)
				.attr("y1",function(d,i){return yScale(gridLines[i])})
				.attr("x2",obj.width-obj.padding)
				.attr("y2",function(d,i){return yScale(gridLines[i])});
		}
		
		/* AXIS */
		// X
		xAxis = d3.svg.axis()
					.scale(xScale)
					.orient("bottom");
					
		x = chart.append("g")
			.attr("id","xAxis")
			.attr("class","x axis")
			.attr("transform", "translate(0," + (obj.height - obj.padding) + ")")
			.call(xAxis)
			.selectAll("text")  // rotate text
				.style("text-anchor", "middle")
				.attr("y", "1em")
				.attr("transform", function(d) {
					return "rotate(0)";
				});			
		// x labels line break (only works for two Strings with a whitespace inbetween)
		var manualLineBr=function(d) {
			var el=d3.select(this);
			var words=d.split(' ');
			el.text(words[0]);
			el.append('tspan').text(words[1]).attr("x",0).attr("dy",".9em");
		};
		d3.select("#xAxis").selectAll("text").each(manualLineBr);		
		
		// Y
		//draw y axis
		yAxis = d3.svg.axis()
					  .scale(yScale)
					  .tickValues([0,(yMax)/2,yMax])
					  .tickFormat(d3.format(",.2f"))
					  .orient("left");
		y = chart.append("g")
				.attr("class","y axis")
				.attr("transform", "translate(" + obj.padding + ",0)")
				.call(yAxis);
		
		/* BARS */
		volumes=data.map(function(d){return d.volume;});
		maxVolume=Math.max.apply(Math, volumes);
		barWidths = new Array();
			for(var v in volumes) {
				barWidths.push((xScale.rangeBand() * volumes[v])/maxVolume);
			}
	} //beforeDrawing
	
	/**
	* Initialize chart
	* @data initial data
	*/
	this.init = function(data) {
		beforeDrawing(data);
		
		// x axis label (Volume)
		chart.append("text").attr("class","axis label")
					.attr("x",obj.width/2)
					.attr("y", obj.height)
					.style("text-anchor", "middle")					  
					.text("Volume");		
		
		// y axis label
		chart.append("text").attr("class","axis label")
					.attr("x",-obj.height/2)
					.attr("y", ".7em")
					.style("text-anchor", "middle")
					.attr("transform", function(d) {
						return "rotate(-90)" 
					})						  
					.text("Margin");		
		
		//initial bars (invisible)
		bars=chart.selectAll("rect")
			.data(data.map(function(d){return d.margin;}))
			.enter().append("rect")
			.attr("class","bar")
			.attr("id", "bar")
			.attr("x", function(d,i) {
				return xScale(i)+((xScale.rangeBand()-barWidths[i])/2);
			})
			.attr("y",yScale(0))
			.attr("width", 0)
			.attr("height", 0);
			
		transition(data);
		previousDataLength=data.length;
	} //init
	
	this.init(obj.data); // First run only
};	