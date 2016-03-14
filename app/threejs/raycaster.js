
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
function loadShaders() {
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
          init();
        });
      });
    });
  });
}


function init() {

  container = $('#main');

  camera = new THREE.PerspectiveCamera( 60, screenSize.x/screenSize.y, 0.1, 100000 );
  camera.position.z = 2;

  sceneFirstPass = new THREE.Scene();
	sceneSecondPass = new THREE.Scene();

  var randomdata = [];
  for( var i = 0; i < 64; i++) {
    randomdata[i] = [];
    for( var j = 0; j < 64; j++) {
      randomdata[i][j] = [];
      for( var k = 0; k < 64; k++) {
        randomdata[i][j].push(Math.min(Math.floor(Math.random()*4095*55.5), 4095));
        if(Math.random()*1 >= 1/64.0*k*1.5) {
          randomdata[i][j][k] = 0.0;
        }
      }
    }
    console.log("random data progress: " + i/64 + " %");
  }

  mosaic.createMosaicImage(64,64,randomdata, function(canvas) {//THREE.ImageUtils.loadTexture('/assets/images/bonsai.raw.png' );
    cubeTexture = new THREE.Texture(canvas);
    cubeTexture.needsUpdate = true;
    console.log(cubeTexture);
    //cubeTexture = THREE.ImageUtils.loadTexture('/assets/images/bonsai.raw.png');
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
          value: 64
        },
  			alphaCorrection : {
          type: "1f" ,
          value: 1.0
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
    renderer.setClearColor("#FFFFFF");
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
	grd.addColorStop(0.1, "#00FF00");
	grd.addColorStop(0.7, "#FF0000");
	grd.addColorStop(1.0, "#0000FF");
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
  loadShaders();

  console.log("HALVEIS");
  $('#tf-holder').tfWidget(function (controlPoints, tfArray) {


    console.log("TRANSFERFUNCTION");
  });


});

$(document).on('rotationValueChanged', function(event, x, y) {
  console.log('rotationValueChanged: ' + x + ', ' + y);
  rx = x;
  ry = y;
});
