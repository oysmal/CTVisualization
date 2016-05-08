import context from '../components/Context/context.es6';

let container;

let controls;
let camera, renderer;
let transferTexture;

let sceneFirstPass, sceneSecondPass;
let rtTexture, sizez;
let cubeTexture;
let materialFirstPass, materialSecondPass;

let sceneFirstPass2, sceneSecondPass2;
let rtTexture2, sizez2;
let cubeTexture2;
let materialFirstPass2, materialSecondPass2;

let mesh, geometry;
let spheres = [];

let vertexShader1, fragmentShader1;
let vertexShader2, fragmentShader2;
let transferTextureIsUpdated = false;

let grd, canvas, ctx;
let controlPointsTF = [];
let isFirstLaunch = true;

//let screenSize = {x: 640, y: 480};
let screenSize = {x: 640, y: 720};
let windowHalfX = screenSize.x / 2;
let windowHalfY = screenSize.y / 2;

let renderStage = 0; // 0: pre-sets, 1: first render, 2: second render
let props;
let currentlyLoadedFiles = [];

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
function loadShaders(files) {
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

          if (isFirstLaunch) {
            preInit();
            isFirstLaunch = false;
          }

          for (var i = 0; i < files.length; i++) {
            init(files[i]);
            renderStage++;
          }
        });
      });
    });
  });
}

function preInit() {
  container = $('#main');
  tfWidgetInit();
  props = context();

  camera = new THREE.PerspectiveCamera( 60, screenSize.x/screenSize.y, 0.1, 100000 );
  camera.position.x = 0;
  camera.position.y = 1.5;
  camera.position.z = -0.1;
  camera.lookAt(new THREE.Vector3(0,0,0));

  sceneFirstPass = new THREE.Scene();
  sceneFirstPass2 = new THREE.Scene();
  sceneSecondPass = new THREE.Scene();

  readyGradientForTransferfunction();
  transferTexture = updateTransferFunction();

  renderer = new THREE.WebGLRenderer({canvas: document.getElementById('appCanvas')});
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( screenSize.x, screenSize.y );
  renderer.autoClear = true;
  renderer.setClearColor("#00FF00");

  // set up controls
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.dampingFactor = 0.25;
  controls.enableZoom = true;
  renderStage++;
}


function init(name) {
  
if (renderStage == 1) {

  // create Texture
  cubeTexture = props.files[name].tex;
  sizez = props.files[name].sizez;

  cubeTexture.needsUpdate = true;
  cubeTexture.generateMipmaps = false;
  cubeTexture.minFilter = THREE.LinearFilter;
  cubeTexture.magFilter = THREE.LinearFilter;

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
            value: Math.ceil(Math.sqrt(3)*sizez)
          },
          x_plane_pos: {
            type: "1f",
            value: 10.0
          },
          y_plane_pos: {
            type: "1f",
            value: 10.0
          },
          z_plane_pos: {
            type: "1f",
            value: -10.0
          },
          x_plane_cut_dir: {
            type: "1f",
            value: 1.0
          },
          y_plane_cut_dir: {
            type: "1f",
            value: 1.0
          },
          z_plane_cut_dir: {
            type: "1f",
            value: 1.0
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

  } else if (renderStage == 2) {

  // create Texture
  cubeTexture2 = props.files[name].tex;
  sizez2 = props.files[name].sizez;

  cubeTexture2.needsUpdate = true;
  cubeTexture2.generateMipmaps = false;
  cubeTexture2.minFilter = THREE.LinearFilter;
  cubeTexture2.magFilter = THREE.LinearFilter;

  rtTexture2 = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
    {   minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS:  THREE.ClampToEdgeWrapping,
      wrapT:  THREE.ClampToEdgeWrapping,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
      generateMipmaps: false} );


      materialFirstPass2 = new THREE.ShaderMaterial( {
        vertexShader: vertexShader1,
        fragmentShader: fragmentShader1,
        side: THREE.BackSide
      } );

      materialSecondPass2 = new THREE.ShaderMaterial( {
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader2,
        side: THREE.FrontSide,
        uniforms: {
          tex:  {
            type: "t",
            value: rtTexture2
          },
          cubeTex:
          {
            type: "t",
            value: cubeTexture2
          },
          transferTex:
          {
            type: "t",
            value: transferTexture
          },
          steps : {
            type: "1f" ,
            value: sizez2
          },
          numSlices : {
            type: "1f" ,
            value: sizez2
          },
          alphaCorrection : {
            type: "1f" ,
            value: 0.5
          },
          maxSteps: {
            type: "1i" ,
            value: Math.ceil(Math.sqrt(3)*sizez)
          },
          x_plane_pos: {
            type: "1f",
            value: 10.0
          },
          y_plane_pos: {
            type: "1f",
            value: 10.0
          },
          z_plane_pos: {
            type: "1f",
            value: -10.0
          },
          x_plane_cut_dir: {
            type: "1f",
            value: 1.0
          },
          y_plane_cut_dir: {
            type: "1f",
            value: 1.0
          },
          z_plane_cut_dir: {
            type: "1f",
            value: 1.0
          }
        }
    });


    // Geometry setup
    let boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    boxGeometry.doubleSided = true;
    let meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass2 );
    let meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass2 );
    sceneFirstPass2.add( meshFirstPass );
    sceneSecondPass.add( meshSecondPass ); 
    meshSecondPass.position.x = 1;

    window.addEventListener( 'resize', onWindowResize, false );

    animate();    
    renderStage = 0;
  }

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
    updateTextures();
    transferTextureIsUpdated = false;
  }


  renderer.render( sceneFirstPass, camera, rtTexture, true );
  renderer.render( sceneFirstPass2, camera, rtTexture2, true );

  renderer.render( sceneSecondPass, camera );
  
  materialSecondPass.uniforms.steps.value = sizez;
  materialSecondPass.uniforms.alphaCorrection.value = 1.0;

  materialSecondPass2.uniforms.steps.value = sizez2;
  materialSecondPass2.uniforms.alphaCorrection.value = 1.0;
}

function updateTextures() {
  let transferTemp = updateTransferFunction();
  materialSecondPass.uniforms.transferTex.value = transferTemp;
  materialSecondPass2.uniforms.transferTex.value = transferTemp;
}

function readyGradientForTransferfunction() {
  canvas = document.createElement('canvas');
  canvas.height = 32;
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
