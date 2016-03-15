
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

var screenSize = {x: 640, y: 480};
var windowHalfX = screenSize.x / 2;
var windowHalfY = screenSize.y / 2;

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

  camera = new THREE.PerspectiveCamera( 60, screenSize.x/screenSize.y, 0.1, 100000 );
  camera.position.z = 5;
  //camera.position.y = -5;
  camera.lookAt(new THREE.Vector3(0,0,0));

  sceneFirstPass = new THREE.Scene();
	sceneSecondPass = new THREE.Scene();

  // var randomdata = [];
  // randomdata.push(72);
  // randomdata.push(72);
  // randomdata.push(72);
  // for( var i = 3; i < 72*72*72+3; i++) {
  //   randomdata.push(Math.min(Math.floor(Math.random()*4095*55.5), 4095));
  //   if(Math.random()*1 >= 0.3) {
  //     randomdata[i] = 0.0;
  //   }
  // }

  mosaic.createMosaicImage(data, function(canvas) {

    cubeTexture = new THREE.Texture(canvas);
    cubeTexture.needsUpdate = true;
    cubeTexture.generateMipmaps = false;
    cubeTexture.minFilter = THREE.LinearFilter;
    cubeTexture.magFilter = THREE.LinearFilter;

    container.append(canvas);

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
          value: 257
        },
  			alphaCorrection : {
          type: "1f" ,
          value: 0.1
        },
        scaleFactor: {
          type: "1f" ,
          value: mosaic.scaleFactor
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

  //var delta = clock.getDelta();
	//Render first pass and store the world space coords of the back face fragments into the texture.
	renderer.render( sceneFirstPass, camera, rtTexture, true );
	//Render the second pass and perform the volume rendering.
	renderer.render( sceneSecondPass, camera );
	materialSecondPass.uniforms.steps.value = 256;
	materialSecondPass.uniforms.alphaCorrection.value = 1.0;

}

function updateTextures(value) {
  materialSecondPass.uniforms.transferTex.value = updateTransferFunction();
}

function updateTransferFunction() {
	var canvas = document.createElement('canvas');
	canvas.height = 20;
	canvas.width = 256;
	var ctx = canvas.getContext('2d');
	var grd = ctx.createLinearGradient(0, 0, canvas.width -1 , canvas.height - 1);

  grd.addColorStop(0.0,'rgba(0,0,0,0.0)');
  grd.addColorStop(0.1,'rgba(0,0,0,0.0)');
  grd.addColorStop(0.2,'rgba(0,255,255,0.1)');
  grd.addColorStop(0.3,'rgba(155,0,0,0.1)');
  grd.addColorStop(0.4,'rgba(255,0,0,0.2)');
  grd.addColorStop(0.5,'rgba(255,255,255,0.6)');
  grd.addColorStop(1.0,'rgba(255,255,255,1.0)');
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


$(document).on('readyForCanvasRaycaster', function(event) {
  console.log("readyForCanvasRaycaster");
  //loadShaders();

  console.log("HALVEIS");
  $('#tf-holder').tfWidget(function (controlPoints, tfArray) {


    console.log("TRANSFERFUNCTION");
  });


});

$(document).on('selectedFileReadyForRaycast', function(event) {
  loadShaders(window.arr);
});

$(document).on('cameraChangeEvent', function(event, cam) {
  console.log("cameraChangeEvent");
  console.log(cam);
  camera.position.x = cam.x;
  camera.position.y = cam.y;
  camera.position.z = cam.z;
  camera.lookAt(new THREE.Vector3(0,0,0));
});
