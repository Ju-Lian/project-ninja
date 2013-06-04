/** 
* Expected headings
* Product, Margin, Volume
*/
function ReadCSV_VolumeMargin(path, func) {
	d3.csv(path, function(d) 
	{
		return {
			product: d.Product,
			margin: +d.Margin,
			volume: +d.Volume
		};
	}, 
	function(error, rows) 
	{
		//call custum function func here
		//console.log(rows);
		return func(rows);
	});
}	