var mosaic = {};

mosaic.createOneImage = function(sizex, sizey, data) {
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", sizex);
	canvas.setAttribute("height", sizey);
	var ctx = canvas.getContext('2d');

	for(var i = 0; i < sizey; i++) {
		for(var j = 0; j < sizex; j++) {
			var id = ctx.createImageData(1,1);
			var msb = data[i*sizex+j] & 0xFF00;
			msb = msb >> 8;
			var lsb = data[i*sizex+j] & 0x00FF;
			// Use bitmask for spliting the uint16 value into two uint8 to fit into img
			id.data[0] = msb;	// r
			id.data[1] = lsb;	// g
			id.data[2] = 0;	// b
			id.data[3] = 255;//Math.floor(data[i][j]/4095*255);	// a
			ctx.putImageData(id, j, i); // row based, so add to x=j, y=i
		}
	}

	var image = new Image();
	image.src = canvas.toDataURL("/image/png");
	return image;
}

mosaic.createMosaicImage = function(data, callback) {

	var sizex = data[0];
	var sizey = data[1];
	var sizez = data[2];
	data = data.slice(2);


	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", sizex*Math.floor(Math.sqrt(sizez)));
	canvas.setAttribute("height", sizey*Math.floor(Math.sqrt(sizez)));
	var ctx = canvas.getContext('2d');

	var row = 0;
	var col = 0;

	for(var i = 0; i < sizez; i++) {
		col = i % Math.ceil(Math.sqrt(sizez));
		var image = this.createOneImage(sizex, sizey, data.slice(i*sizex*sizey, i*sizex*sizey+sizex*sizey));
		ctx.drawImage(image, sizex*col, sizey*row, sizex, sizey);
		console.log("image generation progress: " + Math.floor(i/sizez*100) + " %");

		if(col == Math.ceil(Math.sqrt(sizez))-1) {
			row++;
		}
	}

	console.log("data");
	console.log(data);
	console.log(data[0]);
	console.log("sizes: " + sizex + ", " + sizey + ", " + sizez);

	callback(canvas);
}
