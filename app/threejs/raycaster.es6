import context from '../components/Context/context.es6';
import * as cutting from './cutting.es6';

let container;

let controls;
let camera, sceneFirstPass, sceneSecondPass, renderer;
let rtTexture;
let cubeTexture;
let transferTexture;
let scale_x, scale_y, scale_z;

let materialFirstPass, materialSecondPass;

let mesh, geometry;
let cutting_x, cutting_y, cutting_z;

let vertexShader1, fragmentShader1;
let vertexShader2, fragmentShader2;
let transferTextureIsUpdated = false;

let grd, canvas, ctx;
let controlPointsTF = [];

let screenSize = {x: 800, y: 640};
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
function loadShaders(filename) {
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
          init(filename);
        });
      });
    });
  });
}


function init(name) {

  container = $('#main');
  let props = context();
  tfWidgetInit();

  camera = new THREE.PerspectiveCamera( 60, screenSize.x/screenSize.y, 0.1, 100000 );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = -2;
  camera.lookAt(new THREE.Vector3(0,0,0));

  sceneFirstPass = new THREE.Scene();
  sceneSecondPass = new THREE.Scene();

  cutting.init(sceneSecondPass);

  // create Texture
  cubeTexture = props.files[name].tex;
  sizez = props.files[name].sizez;

  cubeTexture.needsUpdate = true;
  cubeTexture.generateMipmaps = false;
  cubeTexture.minFilter = THREE.LinearFilter;
  cubeTexture.magFilter = THREE.LinearFilter;

  readyGradientForTransferfunction();
  transferTexture = updateTransferFunction();

  rtTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS:  THREE.ClampToEdgeWrapping,
      wrapT:  THREE.ClampToEdgeWrapping,
      format: THREE.RGBFormat,
      type: THREE.FloatType,
      generateMipmaps: false
    }
  );


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
        value: cutting.getCuttingPosX()
      },
      y_plane_pos: {
        type: "1f",
        value: cutting.getCuttingPosY()
      },
      z_plane_pos: {
        type: "1f",
        value: cutting.getCuttingPosZ()
      },
      x_plane_cut_dir: {
        type: "1f",
        value: cutting.getCuttingDirX()
      },
      y_plane_cut_dir: {
        type: "1f",
        value: cutting.getCuttingDirY()
      },
      z_plane_cut_dir: {
        type: "1f",
        value: cutting.getCuttingDirZ()
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

  let xl = new THREE.Geometry();
  xl.vertices.push(new THREE.Vector3(-100, 0, 0));
  xl.vertices.push(new THREE.Vector3(0, 0, 0));
  xl.vertices.push(new THREE.Vector3(100, 0, 0));
  let xlmat = new THREE.LineBasicMaterial({color: 0xFF0000});
  let yl = new THREE.Geometry();
  yl.vertices.push(new THREE.Vector3(0, -100, 0));
  yl.vertices.push(new THREE.Vector3(0, 0, 0));
  yl.vertices.push(new THREE.Vector3(0, 100, 0));
  let ylmat = new THREE.LineBasicMaterial({color: 0x00FF00});
  let zl = new THREE.Geometry();
  zl.vertices.push(new THREE.Vector3(0, 0, -100));
  zl.vertices.push(new THREE.Vector3(0, 0, 0));
  zl.vertices.push(new THREE.Vector3(0, 0, 100));
  let zlmat = new THREE.LineBasicMaterial({color: 0x0000FF});

  let xlm = new THREE.Line(xl, xlmat);
  let ylm = new THREE.Line(yl, ylmat);
  let zlm = new THREE.Line(zl, zlmat);
  sceneSecondPass.add(xlm);
  sceneSecondPass.add(ylm);
  sceneSecondPass.add(zlm);

  window.addEventListener( 'resize', onWindowResize, false );

  animate();
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

  //update cutting planes
  materialSecondPass.uniforms.x_plane_pos.value = cutting.getCuttingPosX();
  materialSecondPass.uniforms.y_plane_pos.value = cutting.getCuttingPosY();
  materialSecondPass.uniforms.z_plane_pos.value = cutting.getCuttingPosZ();
  materialSecondPass.uniforms.x_plane_cut_dir.value = cutting.getCuttingDirX();
  materialSecondPass.uniforms.y_plane_cut_dir.value = cutting.getCuttingDirY();
  materialSecondPass.uniforms.z_plane_cut_dir.value = cutting.getCuttingDirZ();

  //Render first pass and store the world space coords of the back face fragments into the texture.
  renderer.render( sceneFirstPass, camera, rtTexture, true );
  //Render the second pass and perform the volume rendering.
  renderer.render( sceneSecondPass, camera );
  materialSecondPass.uniforms.steps.value = sizez;
  materialSecondPass.uniforms.alphaCorrection.value = 0.5;



}

function updateTextures(value) {
  materialSecondPass.uniforms.transferTex.value = updateTransferFunction();
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
