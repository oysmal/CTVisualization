var mosaic = {};

mosaic.createOneImage = function(sizex, sizey, data) {
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", sizex);
	canvas.setAttribute("height", sizey);
	var ctx = canvas.getContext('2d');

	for(var i = 0; i < data.length; i++) {
		for(var j = 0; j < data[0].length; j++) {
			var id = ctx.createImageData(1,1);
			var msb = data[i][j] & 0xFF00;
			msb = msb >> 8;
			var lsb = data[i][j] & 0x00FF;
			// Use bitmask for spliting the uint16 value into two uint8 to fit into img
			id.data[0] = msb;	// r
			id.data[1] = lsb;	// g
			id.data[2] = 0;	// b
			id.data[3] = Math.floor(data[i][j]/4095*255);	// a
			ctx.putImageData(id, j, i); // row based, so add to x=j, y=i
		}
	}

	var image = new Image();
	image.src = canvas.toDataURL("/image/png");
	return image;
}

mosaic.createMosaicImage = function(sizex, sizey, data) {
	var canvas = document.createElement("canvas");
	canvas.setAttribute("width", sizex*8);
	canvas.setAttribute("height", sizey*8);
	var ctx = canvas.getContext('2d');

	for(var i = 0; i < 8; i++) {
		for(var j = 0; j < 8; j++) {
			var image = this.createOneImage(sizex, sizey, data[i*j+j]);
			ctx.drawImage(image, sizex*i, sizey*j, sizex, sizey);
			console.log("image generation progress: " + Math.floor((i*j+j)/data.length*100) + " %");
		}
	}
	var img = new Image();
	img.src = canvas.toDataURL("/image/png");
	return img;
}
