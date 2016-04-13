import Mosaic from './utils/createMosaicImage.es6';
import THREE from '../../bower_components/three.js/three.js';


var container;

var camera, sceneFirstPass, sceneSecondPass, renderer;
var rtTexture;
var cubeTexture;
var transferTexture;

var materialFirstPass, materialSecondPass;

var mesh, geometry;
var spheres = [];

var vertexShader1, fragmentShader1;
var vertexShader2, fragmentShader2;
var transferTextureIsUpdated = false;

var grd, canvas, ctx;
var controlPointsTF = [];

var screenSize = {x: 640, y: 480};
var windowHalfX = screenSize.x / 2;
var windowHalfY = screenSize.y / 2;

var sizez;


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

        loadResource('/assets/shaders/raycaster.secondpass.hand.fs', function(err, data) {
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

  var mosaic = new Mosaic();

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
          value: sizez
        },
  			alphaCorrection : {
          type: "1f" ,
          value: 1.0
        },
        maxSteps: {
          type: "1i" ,
          value: Math.ceil(Math.sqrt(3)*sizez)
        }
      }
  	 });


    // Geometry setup
  	var boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
  	boxGeometry.doubleSided = true;
  	var meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
  	var meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );
  	sceneFirstPass.add( meshFirstPass );
  	sceneSecondPass.add( meshSecondPass );


    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( screenSize.x, screenSize.y );
    renderer.autoClear = true;
    renderer.setClearColor("#000000");
    console.log("clear color: ");
    console.log(renderer.getClearColor());
    renderer.domElement.setAttribute('id', 'canvas');
    container.append( renderer.domElement );

    var b = new THREE.BoxGeometry(2,2,2);
    var bmat = new THREE.MeshBasicMaterial({color: "#FF0000"});

    var bmesh = new THREE.Mesh(b, bmat);
    bmesh.position.x = 0;
    bmesh.position.y = 0;
    bmesh.position.z = 0;

    //sceneSecondPass.add(bmesh);

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

  render();

}

function render() {

  if (transferTextureIsUpdated) {
    console.log(controlPointsTF);
    updateTextures();
    transferTextureIsUpdated = false;
  }
  //var delta = clock.getDelta();
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

  for (var i = 0; i < controlPointsTF.length; i++) {
    grd.addColorStop(controlPointsTF[i].index,
      controlPointsTF[i].rgba);
  }

	ctx.fillStyle = grd;
	ctx.fillRect(0,0,canvas.width -1 ,canvas.height -1 );

  var img = document.getElementById("transferTexture");
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
    var temp = [];
    for(var i = 0; i < controlPoints.length; i++) {

      //var rgb = controlPoints[i].rgb;
      //rgb = rgb.replace(/[^\d,]/g, '').split(',');
      //var alpha = controlPoints[i].alpha;

      temp[i] = controlPoints[i];
      temp[i].index = controlPoints[i].index;
      //temp[i].rgba = 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha+')';
      temp[i].rgba = convertHex(controlPoints[i].rgb, controlPoints[i].alpha);
    }
    controlPointsTF = temp;
    transferTextureIsUpdated = true;
  });
}

function convertHex(hex,opacity) {
    var hex = hex.replace('#','');
    var r = parseInt(hex.substring(0,2), 16);
    var g = parseInt(hex.substring(2,4), 16);
    var b = parseInt(hex.substring(4,6), 16);

    var result = 'rgba('+r+','+g+','+b+','+opacity+')';
    return result;
}

function updateCamera(cam) {
  console.log("cameraChange");
  console.log(cam);
  camera.position.x = cam.x || camera.position.x;
  camera.position.y = cam.y || camera.position.y;
  camera.position.z = cam.z || camera.position.z;
  camera.lookAt(new THREE.Vector3(0,0,0));
};

export default {loadShaders, updateCamera};
