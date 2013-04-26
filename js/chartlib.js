//Random value

//Get random values for testing

function getRandom(min, max) {

	if(min > max) { return -1; }
								 
	if(min == max) { return min; }
								 
	var r;
								 
	do { r = Math.random(); }
	while(r == 1.0);
									
	return min + parseInt(r * (max-min+1));

}


// Cash Conversion Cycle

// DPO			 CCC
// 23			   7
// ######### #######
// ####### #########
// 10		      20
// DIO 			 DSO

function cccChart(obj) {

	var widthMax = obj.data[0].width + obj.padding + obj.data[1].width;

	var spacing = 40;

	var widthScale = d3.scale.linear()
		.domain([0, widthMax])
		.rangeRound([obj.padding, obj.containerWidth-obj.padding*2])
		;

	var title = obj.container
		.append("text")
		.attr("x", obj.padding)
		.attr("y", obj.padding)
		.attr("font-size", 12)
		.attr("font-weight", "bold")
		.attr("font-family", "Helvetica")
		.text(obj.name)
		;

	var dpo_label = obj.container
		.append("text")
		.attr("x", obj.padding)
		.attr("y", obj.padding*3)
		.attr("font-size", 12)
		.attr("font-weight", "bold")
		.attr("font-family", "Helvetica")
		.text(obj.data[0].label)
		;

	var dpo_value = obj.container
		.append("text")
		.attr("x", obj.padding)
		.attr("y", obj.padding*4.5)
		.attr("font-size", 12)
		.attr("font-weight", "bold")
		.attr("font-family", "Helvetica")
		.text(obj.data[0].width)
		;

	var upper_bar = obj.container
		.append("rect")
		.attr("x", obj.padding)
		.attr("y", obj.padding+spacing)
		.attr("width", widthScale(widthMax))
		.attr("height", obj.barHeight)
		;

	var upper_divider = obj.container
		.data(obj.data)
		.append("rect")
		.attr("x", obj.containerWidth/2-obj.padding)
		.attr("y", obj.padding+spacing)
		.attr("width", obj.padding*2)
		.attr("height", obj.barHeight)
		.attr("fill", "#ffffff")		
		 .transition()
		  .duration(500)
			.attr("x", widthScale(obj.data[0].width))
		;

	var lower_bar = obj.container
		.append("rect")
		.attr("x", obj.padding)
		.attr("y", obj.padding*3+spacing)
		.attr("width", widthScale(widthMax))
		.attr("height", obj.barHeight)
		;

	var lower_divider = obj.container
		.append("rect")
		.attr("x", obj.containerWidth/2-obj.padding)
		.attr("y", obj.padding*3+spacing)
		.attr("width", obj.padding*2)
		.attr("height", obj.barHeight)
		.attr("fill", "#ffffff")		
		 .transition()
		  .duration(500)
			.attr("x", widthScale(obj.data[2].width))
		;
}


function cccChart2(obj) {

	var widthMax = obj.data[0].width + obj.padding + obj.data[1].width;

	var spacing = 40;

	var widthScale = d3.scale.linear()
		.domain([0, widthMax])
		.rangeRound([obj.padding, obj.containerWidth-obj.padding*2])
		;

	var title = obj.container
		.append("text")
		.attr("x", obj.padding)
		.attr("y", obj.padding)
		.attr("font-size", 12)
		.attr("font-weight", "bold")
		.attr("font-family", "Helvetica")
		.text(obj.name)
		;

	var prev = 0;

	var dpo_bar = obj.container
		.selectAll("rect")
		 .data(obj.data)
		  .enter().append("rect")
		   .attr("x", function(d){
						prev
		   				return obj.padding + prev;
						})
		   .attr("y", obj.padding+spacing)
		   .attr("width", function(d){ 

		   					return d.width; 
		   				})
		   .attr("height", obj.barHeight)
		;
}


function bubble(obj) {
	var data = obj.data;
	
	var xMax = d3.max(data, function(d) { return d.x; });
	var yMax = d3.max(data, function(d) { return d.y; })
	
	//Scale
	var xScale = d3.scale.linear()
		.domain([0, xMax+obj.padding])
		.rangeRound([obj.padding, obj.width-obj.padding]);
					
	var yScale = d3.scale.linear()
		.domain([yMax+obj.padding, 0])
		.rangeRound([obj.padding, obj.height-obj.padding]);
		
	var rScale = d3.scale.linear()
		 .domain([0, d3.max(data, function(d) { return d.r; })])
		 .rangeRound([10, 30])
	
	var xAxis = d3.svg.axis()
                  .scale(xScale)
                  .orient("bottom")
				  .tickValues([0,(xMax+obj.padding)/2,xMax+obj.padding])
				  .tickSize(-obj.height+obj.padding*2);
				  
	if(obj.xCustom){
		xAxis.tickFormat(function(d, i) {return obj.xCustom[i]});
	}
				  
	obj.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(0," + (obj.height - obj.padding) + ")")
		.call(xAxis);
		
	var yAxis = d3.svg.axis()
                  .scale(yScale)
                  .orient("left")
				  .tickValues([0,(yMax+obj.padding)/2,yMax+obj.padding])
				  .tickSize(-obj.width+obj.padding*2);
				  
	if(obj.yCustom){
		yAxis.tickFormat(function(d, i) {return obj.yCustom[i]});
	}
				  
	obj.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(" + obj.padding + ",0)")
		.call(yAxis);

	//Circles	
		
	var g = obj.svg.append("g").attr("id", obj.name);
	
	var circles = g.selectAll("circle")
		.data(data)
		.enter()
		.append("circle");
		
	circles
		.attr("class", "bubble")
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
	
	//scale to fit canvas size
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
	
	var scale = (obj.width-60) / Math.abs(max-min);
	var zeroX = Math.abs(min)*scale+30;
	var offset = zeroX;
	
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
	
	//draw zero line	
	if(obj.showZeroLine){
		g.selectAll(".zeroLine")
		.data([10])
			.enter().append("line")
				.attr("class", "zeroLine")
				.attr("x1", zeroX)
				.attr("x2", zeroX)
				.attr("y1", titleHeight)
				.attr("y2", obj.height);
	}

	//draw bars
	var rect = g.selectAll("rect")
	.data(data)
		.enter()
		.append("rect");
		
	rect
		.attr("x", function(d) {if(d>0){offset = offset + d*scale; return offset -d*scale;}else{return offset = offset + d*scale;}})
		.attr("width",0)
		.attr("title","placeholder");
	rect
		.transition()
		.duration(500)
		.attr("y", function(d,i) {return titleHeight + obj.barHeight*i + obj.barPadding*i;})
		.attr("width", function(d){return Math.abs(d) * scale;})
		.attr("height", obj.barHeight)
		.attr("class", function(d){if(d>0){return obj.css + " "+"green";}else{return obj.css + " "+"red";}});
	
	
	//draw sum line
	if(obj.showSum){
	
		var sum = 0;
		
		for (var i in data) {
			sum = sum + data[i];
		}
	
		g.data([sum])
			.append("rect")
			.attr("x", zeroX)
			.attr("y", titleHeight + data.length*obj.barHeight+data.length*obj.barPadding)
			.attr("width", 0)
			.transition()
			.duration(500)
			.attr("width", function(d){return d*scale})
			.attr("height", obj.barHeight)
			.attr("class", obj.css + " sum");
		
		if(obj.showValues){		
			g.data([sum])
				.append("text")
				.attr("x", function(d){if(d>0){return zeroX+d*scale+5}else{return (d+"").length*7}})
				.attr("y", titleHeight + data.length*obj.barHeight+data.length*obj.barPadding+obj.barHeight/2+5)
				.attr("class", "values sumLabel")
				.text(sum);
			}
	}
	
	//draw Connectors
	if(obj.showConnectors){
		
		
		var data2 = new Array();
		for (var i in data) {
			data2[i] = data[i];
		}
		if(!obj.showSum){
			data2.pop();
		}
		
		offset = zeroX;
		offset2 = zeroX;
		g.selectAll(".barConnector")
		.data(data2)
			.enter().append("line")
			.attr("class", "barConnector")
			.attr("x1", function(d) {if(d>0){return offset = offset + d*scale;}else{return offset = offset + d*scale;}})
			.attr("x2", function(d) {if(d>0){return offset2 = offset2 + d*scale;}else{return offset2 = offset2 + d*scale;}})
			.attr("y1", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*i;})
			.attr("y2", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*(i+1);});
	}
	
	//draw bar connections
	
	if(obj.showValues){
		offset = zeroX;
		g.selectAll(".label")
		.data(data)
			.enter().append("text")
			.attr("class", "values")
			.attr("x", function(d){if(d>0){offset = offset + d*scale; return offset+5}else{offset = offset + d*scale; return offset-(d+"").length*7}})
			.attr("y", function(d,i) {return titleHeight + obj.barHeight*i + obj.barPadding*i + obj.barHeight/2+5;})
			.text(function(d) { return d;});
	}
	
}