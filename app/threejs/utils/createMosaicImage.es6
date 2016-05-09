import context from '../../components/Context/context.es6';

class Mosaic {

	constructor() {
		this.currentProgress;
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
		let canvas = document.createElement("canvas");
		canvas.setAttribute("width", sizex);
		canvas.setAttribute("height", sizey);
		let ctx = canvas.getContext('2d');

		for(let i = 0; i < sizey; i++) {
			for(let j = 0; j < sizex; j++) {
				let id = ctx.createImageData(1,1);
				// let msb = data[i*sizex+j] & 0xFF00;
				// msb = msb >> 8;
				// let lsb = data[i*sizex+j] & 0x00FF;
				// Use bitmask for spliting the uint16 value into two uint8 to fit into img
				id.data[0] = 255;//msb;	// r
				id.data[1] = 255;//lsb;	// g
				id.data[2] = 255;	// b
				id.data[3] = Math.floor(data[i*sizex+j]/4095*255);	// a

				ctx.putImageData(id, j, i); // row based, so add to x=j, y=i
			}
		}

		let image = new Image();
		image.src = canvas.toDataURL("/image/png");


		let canvas3 = document.createElement("canvas");
		canvas3.setAttribute("width", sizex*2.5);
		canvas3.setAttribute("height", sizey*2.5);
		let ctx3 = canvas3.getContext('2d');
		let image2 = new Image();
		ctx3.drawImage(image, 0, 0);
		ctx3.scale(2.5, 2.5);
		ctx3.clearRect(0,0,sizex*2.5, sizey*2.5);
		ctx3.drawImage(image, 0, 0);
		image2.src = canvas3.toDataURL("image/png");
		callback(image, image2);
	}

	createMosaicImage(name, data, callback) {
		let sizex = data[0];
		let sizey = data[1];
		let sizez = data[2];
	  let props = context();
		props.files[name].sizex = sizex;
		props.files[name].sizey = sizey;
		props.files[name].sizez = sizez;

		data = data.slice(2);
		this.sizez = sizez;

		let canvas = document.createElement("canvas");
		this.scaleFactor = 1.0;
		if (sizex*sizez > 16384.0) {
			this.scaleFactor = sizex*sizez/16384.0;
		}

		canvas.setAttribute("width", sizex*sizez/this.scaleFactor);
		canvas.setAttribute("height", sizey/this.scaleFactor);
		let ctx = canvas.getContext('2d');

		let i = 0;
		let that = this;

		(function createImages() {
			that.updateAndPostProgress(i, false);
			that.createOneImage(sizex, sizey, data.slice(i*sizex*sizey, i*sizex*sizey+sizex*sizey), (image, image2) => {
				props.image_arrays[name].push(image2);
				ctx.drawImage(image, sizex*i/that.scaleFactor, 0, sizex/that.scaleFactor, sizey/that.scaleFactor);
			});

			i++;
			if (i < sizez) {
				setTimeout(createImages, 0);
			} else {
				that.updateAndPostProgress(100, true);
				callback(canvas);
			}
		})();
	}

	updateAndPostProgress(currentZ, isLastFrame) {
		if (!isLastFrame) {
			this.currentProgress = Math.floor(currentZ/this.sizez*100) + "%";
		} else {
			this.currentProgress = "100%";
		}
		$("#progressBar").css("width", this.currentProgress);
		$("#progressBar").text(this.currentProgress);

	}
}

export default Mosaic;
