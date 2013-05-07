/*

 _       _________ _       _________ _______      _______           _______  _______ _________ _       _________ ______  
( (    /|\__   __/( (    /|\__    _/(  ___  )    (  ____ \|\     /|(  ___  )(  ____ )\__   __/( \      \__   __/(  ___ \ 
|  \  ( |   ) (   |  \  ( |   )  (  | (   ) |    | (    \/| )   ( || (   ) || (    )|   ) (   | (         ) (   | (   ) )
|   \ | |   | |   |   \ | |   |  |  | (___) |    | |      | (___) || (___) || (____)|   | |   | |         | |   | (__/ / 
| (\ \) |   | |   | (\ \) |   |  |  |  ___  |    | |      |  ___  ||  ___  ||     __)   | |   | |         | |   |  __ (  
| | \   |   | |   | | \   |   |  |  | (   ) |    | |      | (   ) || (   ) || (\ (      | |   | |         | |   | (  \ \ 
| )  \  |___) (___| )  \  ||\_)  )  | )   ( |    | (____/\| )   ( || )   ( || ) \ \__   | |   | (____/\___) (___| )___) )
|/    )_)\_______/|/    )_)(____/   |/     \|    (_______/|/     \||/     \||/   \__/   )_(   (_______/\_______/|/ \___/ 
                                                                                                                       

*/

function column(obj){
	data = obj.data;
	values = [0];
	var sum = 0;
	
	for (var i = 0; i < data.length; i++){
		sum = sum + data[i].x;
		values.push(sum);
	}
	
	sum = 0;
	
	for (var i in data) sum = sum + data[i].x;
	
	alert(sum);
	
	values.push(sum);
	
	var xScale = d3.scale.linear()
		.domain([0, d3.max(values)])
		.rangeRound([10, obj.width-20]);
		
	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickValues(values)
		.tickFormat(function(d) {return d});
		
	var x = obj.svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate(0,"+ (obj.height-20)+")")
		.call(xAxis);
		
	var g = obj.svg.append("g").attr("id", obj.name);
	
	var rect = g.selectAll("rect")
		.data(data)
		.enter()
		.append("rect");
		
	rect
		.attr("class", "rect")
		.attr("x", function(d,i){return xScale(values[i]);})
		.attr("y", obj.height-50)
		.attr("width", function(d){return xScale(d.x);})
		.attr("height", function(d){return d.y});
}



//Random value

//Get some random values for testing

function getRandom(min, max) {

	if(min > max) { return -1; }
								 
	if(min == max) { return min; }
								 
	var r;
								 
	do { r = Math.random(); }
	while(r == 1.0);
									
	return min + parseInt(r * (max-min+1));

}

/*--------------------------------------------------------------------------------------*/
// Cash Conversion Cycle

// DPO			 CCC
// 23			   7
// ######### #######
// ####### #########
// 10		      20
// DIO 			 DSO

function cccChart(obj) {

	var spacing = 40;

	//Draw the 4 bars

	var bars = obj.container
		.selectAll("rect")
		 .data(obj.data)
		  .enter().append("rect")
		   .attr("x", function(d,i){
		   				if(i==0 || i==2){var helper = obj.padding;}
		   				if(i==1 || i==3){var helper = 2*obj.padding + (obj.containerWidth - 3 * obj.padding) * obj.data[i-1].width / (obj.data[i].width + obj.data[i-1].width);}
		   				return helper;
						})
		   .attr("y", function(d,i){
		   				if(i==0 || i==1){var helper = spacing + obj.padding;}
		   				if(i==2 || i==3){var helper = spacing + obj.padding + obj.barHeight + obj.padding/2;}
		   				return helper;
						})
		   .attr("width", function(d, i){ 
		   				if(i==0 || i==2){var helper = (obj.containerWidth - 3 * obj.padding) * obj.data[i].width / (obj.data[i].width + obj.data[i+1].width);}
		   				if(i==1 || i==3){var helper = (obj.containerWidth - 3 * obj.padding) * obj.data[i].width / (obj.data[i].width + obj.data[i-1].width);}
		   				return helper; 
		   				})
		   .attr("height", obj.barHeight)
		   .attr("fill", function(d){
		   				return d.fill;
		   				})
		;

	//Write the bar labels

	var labels = obj.container
		.selectAll(".barlabels")
		 .data(obj.data)
		  .enter().append("text")
		   	.attr("class","barlabels")
		   	.attr("x", function(d,i){
		   				if(i==0 || i==2){var helper = obj.padding;}
		   				if(i==1 || i==3){var helper = obj.containerWidth - obj.padding;}
		   				return helper;
						})
		   	.attr("y", function(d,i){
		   				if(i==0 || i==1){var helper = spacing - obj.padding;}
		   				if(i==2 || i==3){var helper = spacing + obj.padding + 2*obj.barHeight + obj.padding/2 +29;}
		   				return helper;
						})
		   	.text(function(d){ return d.label; })
			.attr("text-anchor", function(d,i){
		   				if(i==0 || i==2){var helper = "start";}
		   				if(i==1 || i==3){var helper = "end";}
		   				return helper;
						})
	;

	//Write the bar values

	var values = obj.container
		.selectAll(".barvalues")
		 .data(obj.data)
		  .enter().append("text")
		   	.attr("class","barvalues")
		   	.attr("x", function(d,i){
		   				if(i==0 || i==2){var helper = obj.padding;}
		   				if(i==1 || i==3){var helper = obj.containerWidth - obj.padding;}
		   				return helper;
						})
		   	.attr("y", function(d,i){
		   				if(i==0 || i==1){var helper = spacing + obj.padding/2;}
		   				if(i==2 || i==3){var helper = spacing + obj.padding + 2*obj.barHeight + obj.padding/2 +14;}
		   				return helper;
						})
		   	.text(function(d){ return d.width; } )
			.attr("text-anchor", function(d,i){
		   				if(i==0 || i==2){var helper = "start";}
		   				if(i==1 || i==3){var helper = "end";}
		   				return helper;
						})
	;

	//Write chart title

	var title = obj.container
		.append("text")
		.attr("class","title")
		.attr("x", obj.padding)
		.attr("y", obj.padding)
		.text(obj.name)
		;

}

/*--------------------------------------------------------------------------------------*/
//Bubble Chart

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
				  //.ticks(3)
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
				  .tickValues([0,yMax/2,yMax])
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
		y.append("text")
		.attr("transform","translate(-40,"+(obj.height/2+obj.yLabel.length*3)+")rotate(-90)")
		.text(obj.yLabel);
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

/*--------------------------------------------------------------------------------------*/
//Waterfall Chart

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
			if(d.sum){offset = 0;}
			if(d.value<0)
			{
				offset = offset + d.value; return xScale(offset)
			}
			else
			{
				offset = offset + d.value; return xScale(offset-d.value)
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
				if(d.sum){return obj.css + " green "+"sum";}else{return obj.css + " "+"green";}
			}
			else
			{
				if(d.sum){return obj.css + " red "+"sum";}else{return obj.css + " "+"red";}
			}});
	
	//value labels
	if(obj.showValues){
		offset = 0;
		g.selectAll(".label")
		.data(data)
			.enter().append("text")
			.attr("class", function(d){if(d.sum){ return "value sumLabel"}else{return "value"}})
			.attr("x", function(d){
				if(d.sum){offset = 0;}
				console.log(offset);
				if(d.value>0)
				{
					offset = offset + d.value; 
						return xScale(offset)+5;
				}
				else
				{
					offset = offset + d.value;
					return xScale(offset)-(d.value+"").length*7;
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
			.attr("x1", function(d) {if(d.sum){offset = 0;}offset = offset + d.value; return xScale(offset)})
			.attr("x2", function(d) {if(d.sum){offset2 = 0;}offset2 = offset2 + d.value; return xScale(offset2)})
			.attr("y1", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*i;})
			.attr("y2", function(d,i) {return titleHeight + obj.barHeight*(i+1) + obj.barPadding*(i+1);});
	}

	
}