function bubble(obj) {
	var data = obj.data;
	
	var xMax = d3.max(data, function(d) { return d.x; });
	var yMax = d3.max(data, function(d) { return d.y; })
	
	xMax = xMax + obj.innerPadding;
	yMax = yMax + obj.innerPadding;
	
	//Scale
	var xScale = d3.scale.linear()
		.domain([0, xMax])
		.rangeRound([obj.padding, obj.width-obj.padding]);
					
	var yScale = d3.scale.linear()
		.domain([yMax, 0])
		.rangeRound([obj.padding, obj.height-obj.padding]);
		
	var rScale = d3.scale.linear()
		 .domain([0, d3.max(data, function(d) { return d.r; })])
		 .rangeRound([10, 30])
	
	var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
				  .tickValues([0,(xMax)/2,xMax])
				  .tickSize(10);
				  
	if(obj.xCustom){
		xAxis.tickFormat(function(d, i) {return obj.xCustom[i]});
	}
				  
	var x = obj.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(0," + (obj.height - obj.padding) + ")")
		.call(xAxis);
		
	var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
				  .tickValues([0,(yMax)/2,yMax])
				  .tickSize(10);
				  
	if(obj.yCustom){
		yAxis.tickFormat(function(d, i) {return obj.yCustom[i]});
	}
				  
	y = obj.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(" + obj.padding + ",0)")
		.call(yAxis);
		
	if(obj.showMatrix){
		x.selectAll("line")
		.attr("y1",-obj.height+obj.padding*2);
		y.selectAll("line")
		.attr("x1",obj.width-obj.padding*2);
	}
	
	if(obj.xLabel){
		x.append("text")
		.attr("x",obj.width/2-obj.xLabel.length*3)
		.attr("y",50)
		.text(obj.xLabel);
	}
	
	if(obj.yLabel){
		var split = obj.yLabel.split(" ");
		var text = y.append("text")
		for (var i = 0; i < split.length; i++)
		text.append("tspan")
		.attr("y", obj.height/2+(i-1)*15)
		.attr("x",-80)
		.text(split[i]);
	}
	
	if(obj.cluster){
		
		var keys = obj.svg.append("g")
		var key = keys.selectAll("circle")
			.data(obj.cluster)
			.enter().append("circle")
			.attr("class",function(d){return d})
			.attr("cx", obj.width-obj.padding+20)
			.attr("cy", function(d,i){return obj.padding+20*(i+1)})
			.attr("r", 8);
		keys.selectAll("text")
			.data(obj.cluster)
			.enter().append("text")
			.attr("class","axis label")
			.attr("x", obj.width-obj.padding+35)
			.attr("y", function(d,i){return obj.padding+20*(i+1)+5})
			.text(function(d){return d;});
		
	}

	//Circles	
		
	var g = obj.svg.append("g").attr("id", obj.name);
	
	var circles = g.selectAll("circle")
		.data(data)
		.enter()
		.append("circle");
		
	circles
		.attr("class", function (d) {if(d.cluster){return "bubble " + d.cluster}else{return "bubble"}})
		.attr("cx", function(d){return xScale(d.x)})
		.attr("cy", function(d){return yScale(d.y)})
		.attr("r", 0);
		
	circles
		.transition()
		.duration(500)
		.attr("r", function(d){return rScale(d.r)});
	
	if(obj.showValues){
		var labels = g.selectAll(".value")
		.data(data)
		.enter()
		.append("text")
		.attr("class", "value")
		.attr("x", function(d){return xScale(d.x)-(d.r+"").length*3.5})
		.attr("y", function(d){return yScale(d.y)+5})
		.text(function (d){return d.r});
	}
	if(obj.showLabels){
		var labels = g.selectAll(".label")
		.data(data)
		.enter()
		.append("text")
		.attr("class", "label")
		.attr("x", function(d){return xScale(d.x)-d.label.length*3})
		.attr("y", function(d){return yScale(d.y)-rScale(d.r)-5})
		.text(function (d){return d.label});
	}
}

function waterfall(obj) {

	var g = obj.svg.append("g").attr("id", obj.name);
	var data = obj.data;
	var max = data[0];
	var min = data[0];
	var helper = data[0];
	var titleHeight = 0;
	
	//Find min and max
	for (var i = 0; i < data.length; i++)
	{
		if (i < data.length -1){
			if(helper+data[i+1]>max)
			{
				max = helper + data[i+1];	
			}
			else 
			{
				if(helper+data[i+1]<min)
				{
					min = helper + data[i+1];
				}
			}
			helper = helper + data[i+1];
		}
	}
	
	
	var xScale = d3.scale.linear()
		.domain([min, max])
		.rangeRound([obj.padding, obj.width-obj.padding]);		
	
	var x0 = xScale(0);
	var offset = 0;
	
	//show title
	if(obj.showTitle){
		titleHeight = 30;
		g.selectAll(".title")
		.data([10])
			.enter().append("text")
				.text(obj.name)
				.attr("class", "title")
				.attr("x", obj.width/2-obj.name.length*3)
				.attr("y", 20);
	}
	
	//zero line	
	if(obj.showZeroLine){
		g.selectAll(".zeroLine")
		.data([10])
			.enter().append("line")
				.attr("class", "zeroLine")
				.attr("x1", x0)
				.attr("x2", x0)
				.attr("y1", titleHeight)
				.attr("y2", obj.height);
	}

	//bars
	var rect = g.selectAll("rect")
	.data(data)
		.enter()
		.append("rect");
		
	rect
		.attr("x", function(d) {if(d<0){offset = offset + d; return xScale(offset)}else{offset = offset + d; return xScale(offset-d)}})
		.attr("width",0)
		.attr("title","placeholder");
	rect
		.transition()
		.duration(500)
		.attr("y", function(d,i) {return titleHeight + obj.barHeight*i + obj.barPadding*i;})
		.attr("width", function(d){return xScale(Math.abs(d))-xScale(0);})
		.attr("height", obj.barHeight)
		.attr("class", function(d){if(d>0){return obj.css + " "+"green";}else{return obj.css + " "+"red";}});
	
	
	//sum line
	if(obj.showSum){
		var sum = 0;
		for (var i in data) {
			sum = sum + data[i];
		}
	
		g.data([sum])
			.append("rect")
			.attr("x", function(d){if(d>0){return x0}else{return xScale(0)-(xScale(Math.abs(d))-xScale(0))}})
			.attr("y", titleHeight + data.length*obj.barHeight+data.length*obj.barPadding)
			.attr("width", 0)
			.transition()
			.duration(500)
			.attr("width", function(d){return xScale(Math.abs(d))-xScale(0)})
			.attr("height", obj.barHeight)
			.attr("class", obj.css + " sum");
		
		if(obj.showValues){		
			g.data([sum])
				.append("text")
				.attr("x", function(d){if(d>0){return x0+xScale(d)-xScale(0)+5}else{return xScale(0)-(xScale(Math.abs(d))-xScale(0))-(d+"").length*7}})
				.attr("y", titleHeight + data.length*obj.barHeight+data.length*obj.barPadding+obj.barHeight/2+5)
				.attr("class", "values sumLabel")
				.text(sum);
			}
	}
	
	//connectors
	if(obj.showConnectors){
		
		var data2 = new Array();
		for (var i in data) {
			data2[i] = data[i];
		}
		if(!obj.showSum){
			data2.pop();
		}
		offset = 0;
		offset2 = 0;
		g.selectAll(".barConnector")
		.data(data2)
			.enter().append("line")
			.attr("class", "barConnector")
			.attr("x1", function(d) {offset = offset + d; return xScale(offset)})
			.attr("x2", function(d) {offset2 = offset2 + d; return xScale(offset2)})
			.attr("y1", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*i;})
			.attr("y2", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*(i+1);});
	}
	//value labels
	if(obj.showValues){
		offset = x0;
		g.selectAll(".label")
		.data(data)
			.enter().append("text")
			.attr("class", "values")
			.attr("x", function(d){if(d>0){offset = offset + xScale(d)-xScale(0); return offset+5}else{offset = offset - (xScale(Math.abs(d))-xScale(0)); return offset-(d+"").length*7}})
			.attr("y", function(d,i) {return titleHeight + obj.barHeight*i + obj.barPadding*i + obj.barHeight/2+5;})
			.text(function(d) { return d;});
	}
	
}


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
}; //MarginVolumeBars