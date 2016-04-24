import Mosaic from './utils/createMosaicImage.es6';

let container;

let controls;
let camera, sceneFirstPass, sceneSecondPass, renderer;
let rtTexture;
let cubeTexture;
let transferTexture;

let materialFirstPass, materialSecondPass;

let mesh, geometry;
let spheres = [];

let vertexShader1, fragmentShader1;
let vertexShader2, fragmentShader2;
let transferTextureIsUpdated = false;

let grd, canvas, ctx;
let controlPointsTF = [];

let screenSize = {x: 640, y: 480};
let windowHalfX = screenSize.x / 2;
let windowHalfY = screenSize.y / 2;

let sizez;


function loadResource(url, callback) {
  $.ajax({
    url: url,
    success: function(data) {
      return callback(null, data);
    },
    error: function(err) {
      return callback(err, null);
    }
  });
}

// Load shaders
function loadShaders(arr) {
  loadResource('/assets/shaders/raycaster.firstpass.vs', function(err, data) {
    if(err) {
      console.log(err);
    }
    vertexShader1 = data;

    loadResource('/assets/shaders/raycaster.firstpass.fs', function(err, data) {
      if(err) {
        console.log(err);
      }
      fragmentShader1 = data;

      loadResource('/assets/shaders/raycaster.secondpass.vs', function(err, data) {
        if(err) {
          console.log(err);
        }
        vertexShader2 = data;

        loadResource('/assets/shaders/raycaster.secondpass.fs', function(err, data) {
          if(err) {
            console.log(err);
          }
          fragmentShader2 = data;
          init(arr);
        });
      });
    });
  });
}


function init(data) {

  container = $('#main');
  tfWidgetInit();

  camera = new THREE.PerspectiveCamera( 60, screenSize.x/screenSize.y, 0.1, 100000 );
  camera.position.x = 0;
  camera.position.y = 1.5;
  camera.position.z = -0.1;
  camera.lookAt(new THREE.Vector3(0,0,0));

  sceneFirstPass = new THREE.Scene();
	sceneSecondPass = new THREE.Scene();

  let mosaic = new Mosaic();

  mosaic.createMosaicImage(data, function(canvas) {

    sizez = mosaic.getSizez();

    cubeTexture = new THREE.Texture(canvas);
    cubeTexture.needsUpdate = true;
    cubeTexture.generateMipmaps = false;
    cubeTexture.minFilter = THREE.LinearFilter;
    cubeTexture.magFilter = THREE.LinearFilter;

    container.append(canvas);

    readyGradientForTransferfunction();
    transferTexture = updateTransferFunction();

    rtTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
  														{ 	minFilter: THREE.LinearFilter,
  															magFilter: THREE.LinearFilter,
  															wrapS:  THREE.ClampToEdgeWrapping,
  															wrapT:  THREE.ClampToEdgeWrapping,
  															format: THREE.RGBFormat,
  															type: THREE.FloatType,
  															generateMipmaps: false} );


    materialFirstPass = new THREE.ShaderMaterial( {
    	vertexShader: vertexShader1,
    	fragmentShader: fragmentShader1,
    	side: THREE.BackSide
    } );

  	materialSecondPass = new THREE.ShaderMaterial( {
    	vertexShader: vertexShader2,
    	fragmentShader: fragmentShader2,
  		side: THREE.FrontSide,
  		uniforms: {
        tex:  {
          type: "t",
          value: rtTexture
        },
  			cubeTex:
        {
          type: "t",
          value: cubeTexture
        },
  			transferTex:
        {
          type: "t",
          value: transferTexture
        },
  			steps : {
          type: "1f" ,
          value: 1024.0
        },
  			numSlices : {
          type: "1f" ,
          value: sizez
        },
  			alphaCorrection : {
          type: "1f" ,
          value: 0.5
        },
        maxSteps: {
          type: "1i" ,
          value: Math.ceil(Math.sqrt(3)*1024.0)
        }
      }
  	 });


    // Geometry setup
  	let boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
  	boxGeometry.doubleSided = true;
  	let meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
  	let meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );
  	sceneFirstPass.add( meshFirstPass );
  	sceneSecondPass.add( meshSecondPass );


    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('appCanvas')});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( screenSize.x, screenSize.y );
    renderer.autoClear = true;
    renderer.setClearColor("#000000");

    // set up controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
  				controls.enableDamping = true;
  				controls.dampingFactor = 0.25;
  				controls.enableZoom = true;

    container.append( renderer.domElement );

    let b = new THREE.BoxGeometry(2,2,2);
    let bmat = new THREE.MeshBasicMaterial({color: "#FF0000"});

    let bmesh = new THREE.Mesh(b, bmat);
    bmesh.position.x = 0;
    bmesh.position.y = 0;
    bmesh.position.z = 0;

    window.addEventListener( 'resize', onWindowResize, false );

    animate();
  });
}

function onWindowResize() {

  windowHalfX = screenSize.x / 2;
  windowHalfY = screenSize.y / 2;

  camera.aspect = screenSize.x/screenSize.y;
  camera.updateProjectionMatrix();

  renderer.setSize( screenSize.x, screenSize.y );

}


function animate() {

  requestAnimationFrame( animate );

  controls.update();

  render();

}

function render() {

  if (transferTextureIsUpdated) {
    console.log(controlPointsTF);
    updateTextures();
    transferTextureIsUpdated = false;
  }

	//Render first pass and store the world space coords of the back face fragments into the texture.
	renderer.render( sceneFirstPass, camera, rtTexture, true );
	//Render the second pass and perform the volume rendering.
	renderer.render( sceneSecondPass, camera );
	materialSecondPass.uniforms.steps.value = sizez;
	materialSecondPass.uniforms.alphaCorrection.value = 1.0;



}

function updateTextures(value) {
  materialSecondPass.uniforms.transferTex.value = updateTransferFunction();
}

function readyGradientForTransferfunction() {
  canvas = document.createElement('canvas');
  canvas.height = 20;
  canvas.width = 256;
  ctx = canvas.getContext('2d');

}

function updateTransferFunction() {
  ctx.clearRect(0,0,canvas.width, canvas.height);

  grd = ctx.createLinearGradient(0, 0, canvas.width -1 , canvas.height - 1);

  for (let i = 0; i < controlPointsTF.length; i++) {
    grd.addColorStop(controlPointsTF[i].index,
      controlPointsTF[i].rgba);
  }

	ctx.fillStyle = grd;
	ctx.fillRect(0,0,canvas.width -1 ,canvas.height -1 );

  let img = document.getElementById("transferTexture");
				img.src = canvas.toDataURL();
				img.style.width = "256 px";
				img.style.height = "20 px";

	transferTexture =  new THREE.Texture(canvas);
	transferTexture.wrapS = transferTexture.wrapT =  THREE.ClampToEdgeWrapping;
	transferTexture.needsUpdate = true;
	return transferTexture;
}



function tfWidgetInit(event) {


  $('#tf-holder').tfWidget( (controlPoints, tfArray) => {
    let temp = [];
    for(let i = 0; i < controlPoints.length; i++) {

      //let rgb = controlPoints[i].rgb;
      //rgb = rgb.replace(/[^\d,]/g, '').split(',');
      //let alpha = controlPoints[i].alpha;

      temp[i] = controlPoints[i];
      temp[i].index = controlPoints[i].index;
      //temp[i].rgba = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha+')';
      temp[i].rgba = convertHex(controlPoints[i].rgb, controlPoints[i].alpha);
    }
    controlPointsTF = temp;
    transferTextureIsUpdated = true;
  });
}

function convertHex(_hex, opacity) {
    let hex = _hex.replace('#','');
    let r = parseInt(hex.substring(0,2), 16);
    let g = parseInt(hex.substring(2,4), 16);
    let b = parseInt(hex.substring(4,6), 16);

    let result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}

function updateCamera(cam) {
  camera.position.x = cam.x || 0;
  camera.position.y = cam.y || 0;
  camera.position.z = cam.z || 0;
  camera.lookAt(new THREE.Vector3(0,0,0));
};

export default {loadShaders, updateCamera};
