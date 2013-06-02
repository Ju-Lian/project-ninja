function xAxis(config){

	var xScale = d3.scale.linear()
		.domain([config.min, config.max])
		.rangeRound([config.padding, config.width-config.padding]);
		
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickValues(config.values)
		.tickFormat(function(d) {return d});
		
	var x = config.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(0,"+(config.height-config.padding)+")")
		.call(xAxis);
		
	return xScale;
}

function yAxis(config){

	var yScale = d3.scale.linear()
		.domain([config.max, config.min])
		.rangeRound([config.padding, config.height-config.padding]);
		
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left")
		.tickValues(config.values)
		.tickFormat(function(d) {return d});
		
	var x = config.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate("+config.padding+",0)")
		.call(yAxis);
		
	return yScale;	
	
}

function bar(config){

	var helper = [];

	for (var i in config.data)
	{
		helper.push(config.data[i].y);
	}

	xScale = xAxis({
			svg: config.svg, 
			width: config.width, 
			height: config.height, 
			padding: config.padding,
			values: [0,100],
			min: 0, 
			max: 100});
			
	yScale = yAxis({
			svg: config.svg, 
			width: config.width, 
			height: config.height, 
			padding: config.padding, 
			values: [0,d3.max(helper)],
			min: 0, 
			max: d3.max(helper)});
			
	function chart(){
			
		var g = config.svg.append("g").attr("id", config.name);
		
		var rect = g.selectAll("rect")
			.data(config.data)
			.enter()
			.append("rect");
		
		var width = 100 / config.data.length;
		
		rect
			.attr("class", "rect")
			.attr("x", function(d,i){return xScale(i*width)})
			.attr("y", function(d){return yScale(d.y)})
			.attr("width", function(d,i){return xScale(width)-config.padding})
			.attr("height", function(d){return config.height-(yScale(d.y)+config.padding)});
	
		return rect;
	}
	
	var rect = chart();
	
	chart.update = function(data) {
		rect
			.data(data)
			.transition()
			.duration(800)
			.attr("height", function(d){return config.height-(yScale(d.y)+config.padding)})
			.attr("y", function(d){return yScale(d.y)});
	};
	
	chart.remove = function() {
	
		rect.remove();
	
	}
	
	
	return chart;

}