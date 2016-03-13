var mosaic = {};

mosaic.createOneImage = function(sizex, sizey, data) {
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", sizex);
	canvas.setAttribute("height", sizey);
	var ctx = canvas.getContext('2d');

	for(var i = 0; i < data.length; i++) {
		for(var j = 0; j < data[0].length; j++) {
			var id = ctx.createImageData(1,1);
			// Use bitmask for spliting the uint16 value into two uint8 to fit into img
			id.data[0] = data[i][j] & 0xFF00;	// r
			id.data[1] = data[i][j] & 0x00FF;	// g
			id.data[2] = 0;	// b
			id.data[3] = 255;	// a
			ctx.putImageData(id, j, i); // row based, so add to x=j, y=i
		}
	}

	var image = new Image();
	image.src = canvas.toDataURL("/image/png");
	return image;
}

mosaic.createMosaicImage = function(sizex, sizey, data) {
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", data[0].length*sizex);
	canvas.setAttribute("height", sizey);
	var ctx = canvas.getContext('2d');

	for(var i = 0; i < data.length; i++) {
		var image = this.createOneImage(sizex, sizey, data[i]);
		ctx.drawImage(imgarr[i], sizex*i, 0, sizex, sizey);
	}
	var img = new Image();
	img.src = canvas.toDataURL("/image/png");
	return img;
}
