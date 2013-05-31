function ReadCSV(path, func) {
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
		//--> Insert custom function here <--
		// -- d3.csv is an asynchronous function, therefore its data cannot be used in another scope outside the csv-function
		// -- data is stored in rows
		console.log(rows);
		func(rows);
	});
}	