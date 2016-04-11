
class Mosaic {

	constructor() {
		this.scaleFactor = 1.0;
		this.sizez = 1.0;
	}

	getSizez() {
		return this.sizez;
	}

	getScaleFactor() {
		return this.scaleFactor;
	}

	createOneImage(sizex, sizey, data, callback) {
		var canvas = document.createElement("canvas");
		canvas.setAttribute("width", sizex);
		canvas.setAttribute("height", sizey);
		var ctx = canvas.getContext('2d');

		for(var i = 0; i < sizey; i++) {
			for(var j = 0; j < sizex; j++) {
				var id = ctx.createImageData(1,1);
				// var msb = data[i*sizex+j] & 0xFF00;
				// msb = msb >> 8;
				// var lsb = data[i*sizex+j] & 0x00FF;
				// Use bitmask for spliting the uint16 value into two uint8 to fit into img
				id.data[0] = 0;//msb;	// r
				id.data[1] = 0;//lsb;	// g
				id.data[2] = 0;	// b
				id.data[3] = Math.floor(data[i*sizex+j]/4095*255);	// a
				ctx.putImageData(id, j, i); // row based, so add to x=j, y=i
			}
		}

		var image = new Image();
		image.src = canvas.toDataURL("/image/png");
		callback(image);
	}

	createMosaicImage(data, callback) {

		var sizex = data[0];
		var sizey = data[1];
		var sizez = data[2];
		data = data.slice(2);
		this.sizez = sizez;

		console.log(this);


		var canvas = document.createElement("canvas");
		this.scaleFactor = 1.0;
		if (sizex*sizey > 16384) {
			this.scaleFactor = sizex*sizez/16384.0;
		}
		canvas.setAttribute("width", sizex*sizez/this.scaleFactor);
		canvas.setAttribute("height", sizey/this.scaleFactor);
		var ctx = canvas.getContext('2d');


		for(var i = 0; i < sizez; i++) {
			this.createOneImage(sizex, sizey, data.slice(i*sizex*sizey, i*sizex*sizey+sizex*sizey), (image) => {
				ctx.drawImage(image, sizex*i/this.scaleFactor, 0, sizex/this.scaleFactor, sizey/this.scaleFactor);
				console.log("image generation progress: " + Math.floor(i/sizez*100) + " %");
			});
		}

		console.log("data");
		console.log(data);
		console.log(data[0]);
		console.log("sizes: " + sizex + ", " + sizey + ", " + sizez);

		callback(canvas);
	}
}

export default Mosaic;
