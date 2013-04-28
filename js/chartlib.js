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
	var max = 0;
	var min = 0;
	var helper = 0;
	var titleHeight = 0;
	
	//Find min and max
	for (var i = 0; i < data.length; i++)
	{
		if (i < data.length){
			if(helper+data[i].value>max&&!data[i].sum)
			{
				max = helper + data[i].value;	
			}
			else 
			{
				if(helper+data[i].value<min&&!data[i].sum)
				{
					min = helper + data[i].value;
				}
			}
			if(!data[i].sum){helper = helper + data[i].value;}
		}
	}
	
	
	var xScale = d3.scale.linear()
		.domain([min, max])
		//.rangeRound([obj.padding, obj.width-obj.padding]);
		.rangeRound([obj.paddingLeft, obj.width-obj.paddingRight]);		
	
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
		.attr("x", function(d) {
			if(d.sum)
			{return xScale(0);}
			else{
				if(d.value<0)
				{
					offset = offset + d.value; return xScale(offset)
				}
				else
				{
					offset = offset + d.value; return xScale(offset-d.value)
				}
			}})
		.attr("width",0)
		.attr("title", function(d){return d.name;});
	rect
		.transition()
		.duration(500)
		.attr("y", function(d,i) {return titleHeight + obj.barHeight*i + obj.barPadding*i;})
		.attr("width", function(d){return xScale(Math.abs(d.value))-xScale(0);})
		.attr("height", obj.barHeight)
		.attr("class", function(d){
			if(d.value>0)
			{
				if(d.sum){return obj.css + " "+"sum";}else{return obj.css + " "+"green";}
			}
			else
			{
				return obj.css + " "+"red";
			}});
	
	//value labels
	if(obj.showValues){
		offset = x0;
		g.selectAll(".label")
		.data(data)
			.enter().append("text")
			.attr("class", function(d){if(d.sum){ return "value sumLabel"}else{return "value"}})
			.attr("x", function(d){
				if(d.value>0){
					if(d.sum){return xScale(d.value)+5}
					else{
						offset = offset + xScale(d.value)-xScale(0); 
						return offset+5
					}
				}
				else
				{
					offset = offset - (xScale(Math.abs(d.value))-xScale(0));
					return offset-(d.value+"").length*7
				}})
			.attr("y", function(d,i) {return titleHeight + obj.barHeight*i + obj.barPadding*i + obj.barHeight/2+5;})
			.text(function(d) { return d.value;});
	}
	//connectors
	if(obj.showConnectors){
		
		offset = 0;
		offset2 = 0;
		data.pop();
		g.selectAll(".barConnector")
		.data(data)
			.enter().append("line")
			.attr("class", "barConnector")
			.attr("x1", function(d) {offset = offset + d.value; return xScale(offset)})
			.attr("x2", function(d) {offset2 = offset2 + d.value; return xScale(offset2)})
			.attr("y1", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*i;})
			.attr("y2", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*(i+1);});
	}

	
}