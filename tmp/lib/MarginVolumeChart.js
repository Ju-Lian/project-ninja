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
*	{
*		product: String,
*		margin: positive Number,
*		volume: positive Number
*	}
*
* Axis
*	y-Axis --> Margin
*	x-Axis --> Volume
*	(IMPORTANT: Margin and Volume values must be greater or equal 0)
*/
function marginVolumeBars(obj) 
{
	var chart = obj.svg.append("g").attr("id", obj.name);
	
	//Sort data
	if(obj.sortByVolume) {
		obj.data.sort(function sortByVolume(x,y) {
			return x.volume-y.volume;
		});
	}
	
	/* SCALES */
	// X
	var xMin=0;
	var xMax=function() 
	{
		var sumVolume=0;
		for(var d in obj.data) {
			sumVolume+=obj.data[d].volume; //Compute sum of all volumes as xMax value
		}
		return sumVolume;		
	};
	var productNames = new Array(); // Product names x Axis
	for(var p in obj.data) {
		productNames.push(obj.data[p].product+" "+obj.data[p].volume); //extract each product name
	}				
	var xScale = d3.scale.ordinal()
				.domain(productNames)
				.rangeRoundBands([0, obj.width], obj.rangeBandsInnerPadding, obj.rangeBandsOuterPadding);
	// Y
	var yMin=0;
	var yMax=Math.max.apply(Math, obj.data.map(function(d){return d.margin;}));
	var yScale = d3.scale.linear()
				.domain([yMin, yMax])
				.range([obj.height - obj.padding,obj.padding]);
	
	/* GRID LINES */
	if(obj.showGridLines) {
		var lineCnt=(yMax<=6) ? Math.floor(yMax) : 6;
		var linePadding=Math.ceil(yMax/lineCnt); //padding between each grid line
		console.log("linePadding="+linePadding+"\tlineCnt="+lineCnt+" "+Math.floor(yMax));
		var gridLines=new Array();
		for(var i=0; i<lineCnt; i++) {
			gridLines.push(yMax-linePadding*i);
		}	
		var grid=chart.append("g").attr("class","grid")
			.attr("transform","translate("+obj.padding+","+obj.padding+")");
			
		grid.selectAll()
			.data(gridLines)
			.enter()
			.append("line")
			.attr("class","gridLine")
			.attr("x1",0)
			.attr("y1",function(d,i){return yScale(0)-yScale(gridLines[i])})
			.attr("x2",obj.width-2*obj.padding)
			.attr("y2",function(d,i){return yScale(0)-yScale(gridLines[i])});		
	}
	/* AXIS */
	// X
	var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");	
	var x = chart.append("g")
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
	// x labels line break
	var manualLineBr=function(d) {
		var el=d3.select(this);
		var words=d.split(' ');
		el.text(words[0]);
		el.append('tspan').text(words[1]).attr("x",0).attr("dy",".9em");
	};
	d3.select("#xAxis").selectAll("text").each(manualLineBr);
	// x axis label (Volume)
	chart.append("text").attr("class","axis label")
				.attr("x",obj.width/2)
				.attr("y", obj.height)
				.style("text-anchor", "middle")					  
				.text("Volume");		
	
	// Y.tickValues([0,(yMax)/2,yMax])
	var yAxis = d3.svg.axis()
				  .scale(yScale)
				  .orient("left")
				  .tickSize(5);
	var y = chart.append("g")
			.attr("class","y axis")
			.attr("transform", "translate(" + obj.padding + ",0)")
			.call(yAxis);
	// y axis label
	chart.append("text").attr("class","axis label")
				.attr("x",-obj.height/2)
				.attr("y", "1em")
				.style("text-anchor", "middle")
				.attr("transform", function(d) {
					return "rotate(-90)" 
				})						  
				.text("Margin");		
	
	/* BARS */
	var volumes=obj.data.map(function(d){return d.volume;});
	var maxVolume=Math.max.apply(Math, volumes);
	var barWidths = new Array();
	for(var v in volumes) {
		barWidths.push((xScale.rangeBand() * volumes[v])/maxVolume);
	}
	chart.selectAll()
		.data(obj.data.map(function(d){return d.margin;}))
		.enter().append("rect")
		.attr("class","bar")
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
};	