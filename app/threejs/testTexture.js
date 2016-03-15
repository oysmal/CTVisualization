//
// var container;
//
// var camera, scene, renderer;
//
// var mesh,geometry;
//
// var windowHalfX = 640 / 2;
// var windowHalfY = 480 / 2;
//
//
// function init() {
//
//   container = $('#main');
//
//   camera = new THREE.PerspectiveCamera( 60, 640/480, 1, 100000 );
//   camera.position.z = 200;
//
//   scene = new THREE.Scene();
//
//   var randomdata = [];
//   for( var i = 0; i < 64; i++) {
//     randomdata[i] = [];
//     for( var j = 0; j < 64; j++) {
//       randomdata[i][j] = [];
//       for( var k = 0; k < 64; k++) {
//         randomdata[i][j].push(Math.floor(Math.random()*4095));
//         if(Math.random()*1 >= 1/64.0*i*1.1) {
//           randomdata[i][j][k] = 0.0;
//         }
//       }
//     }
//     console.log("random data progress: " + Math.floor(i/64*100) + " %");
//   }
//   mosaic.createMosaicImage(64,64,randomdata, function(canvas) {
//     //console.log(img);
//
//   //  container.append(img);
//     var tex = new THREE.Texture(canvas);
//     tex.needsUpdate = true;
//
//     var mat = new THREE.MeshBasicMaterial({map: tex});
//
//     mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), mat );
//     scene.add( mesh );
//
//     //
//
//     renderer = new THREE.WebGLRenderer();
//     renderer.setPixelRatio( window.devicePixelRatio );
//     renderer.setSize( 640, 480 );
//     renderer.setClearColor(0xFFFFFF);
//     //renderer.autoClear = false;
//     renderer.domElement.setAttribute('id', 'canvas');
//     container.append( renderer.domElement );
//
//     window.addEventListener( 'resize', onWindowResize, false );
//   });
// }
//
// function onWindowResize() {
//
//   windowHalfX = 640 / 2;
//   windowHalfY = 480 / 2;
//
//   camera.aspect = 640/480;
//   camera.updateProjectionMatrix();
//
//
//   renderer.setSize( 640, 480 );
//
// }
//
// function animate() {
//
//   requestAnimationFrame( animate );
//
//   render();
//
// }
//
// function render() {
//
//   renderer.render( scene, camera );
//
// }
//
//
// $(document).on('readyForCanvas', function(event) {
//   console.log("readyForCanvas");
//   init();
//   animate();
// });
