import context from '../../components/Context/context.es6';

class Mosaic {

	constructor() {
		this.currentProgress;
		this.scaleFactor = 1.0;
		this.sizez = 1.0;
		this.xray_colors = document.createElement("canvas");
		this.xray_colors.setAttribute('width', 256);
		this.xray_colors.setAttribute('height', 2);
		let ctx = this.xray_colors.getContext('2d');
		ctx.clearRect(0,0,this.xray_colors.width, this.xray_colors.height);

	  let grd = ctx.createLinearGradient(0, 0, this.xray_colors.width -1 , this.xray_colors.height - 1);
	  grd.addColorStop(0.0, 'rgba(0, 0, 0, 0)');
		grd.addColorStop(1/255*13, 'rgba(255, 112, 126, 1.0)');
		grd.addColorStop(1/255*25, 'rgba(100, 0, 242, 1.0)');
	  grd.addColorStop(1/255*50, 'rgba(255, 0, 0, 1.0)');
	  grd.addColorStop(1/255*100, 'rgba(211, 209, 209, 1.0)');
	  grd.addColorStop(1.0, 'rgba(255, 255, 255, 1.0)');

	  ctx.fillStyle = grd;
	  ctx.fillRect(0,0,this.xray_colors.width -1 ,this.xray_colors.height -1 );
	}

	getSizez() {
		return this.sizez;
	}

	getScaleFactor() {
		return this.scaleFactor;
	}

	createOneImage(sizex, sizey, data, callback) {
		let canvas = document.createElement("canvas");
		let canvas2 = document.createElement("canvas");
		canvas.setAttribute("width", sizex);
		canvas.setAttribute("height", sizey);
		canvas2.setAttribute("width", sizex);
		canvas2.setAttribute("height", sizey);
		let ctx = canvas.getContext('2d');
		let ctx2 = canvas2.getContext('2d');

		for(let i = 0; i < sizey; i++) {
			for(let j = 0; j < sizex; j++) {
				var id = ctx.createImageData(1,1);
				var id2 = ctx2.createImageData(1,1);
				// var msb = data[i*sizex+j] & 0xFF00;
				// msb = msb >> 8;
				// var lsb = data[i*sizex+j] & 0x00FF;
				// Use bitmask for spliting the uint16 value into two uint8 to fit into img
				id.data[0] = 0;//msb;	// r
				id.data[1] = 0;//lsb;	// g
				id.data[2] = 0;	// b
				id.data[3] = Math.floor(data[i*sizex+j]/4095*255);	// a

				let color = this.xray_colors.getContext('2d').getImageData(id.data[3], 0, 1, 1);
				id2.data[0] = color.data[0];
				id2.data[1] = color.data[1];
				id2.data[2] = color.data[2];
				id2.data[3] = color.data[3];
				ctx2.putImageData(id2, i, j);

				ctx.putImageData(id, j, i); // row based, so add to x=j, y=i
			}
		}

		let image = new Image();
		image.src = canvas.toDataURL("/image/png");
		let image2 = new Image();
		image2.src = canvas2.toDataURL("/image/png");
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

		var canvas = document.createElement("canvas");
		this.scaleFactor = 1.0;
		if (sizex*sizez > 16384.0) {
			this.scaleFactor = sizex*sizez/16384.0;
		}

		canvas.setAttribute("width", sizex*sizez/this.scaleFactor);
		canvas.setAttribute("height", sizey/this.scaleFactor);
		var ctx = canvas.getContext('2d');

		let i = 0;
		var that = this;

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
