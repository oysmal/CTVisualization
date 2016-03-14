//
// var container;
//
// var camera, scene, renderer;
// var cameraCube, sceneCube;
//
// var mesh, lightMesh, geometry;
// var spheres = [];
//
// var directionalLight, pointLight;
//
// var mouseX = 0;
// var mouseY = 0;
//
// var rx = 5000;
// var ry = 5000;
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
//   camera.position.z = 3200;
//
//   cameraCube = new THREE.PerspectiveCamera( 60, 640/480, 1, 100000 );
//
//   scene = new THREE.Scene();
//   sceneCube = new THREE.Scene();
//
//   var geometry = new THREE.SphereBufferGeometry( 100, 32, 16 );
//
//   var path = "assets/images/pisa/";
//   var format = '.png';
//   var urls = [
//     path + 'px' + format, path + 'nx' + format,
//     path + 'py' + format, path + 'ny' + format,
//     path + 'pz' + format, path + 'nz' + format
//   ];
//
//   var textureCube = new THREE.CubeTextureLoader().load( urls );
//   var material = new THREE.MeshBasicMaterial( { color: 0xffffff, envMap: textureCube } );
//
//   for ( var i = 0; i < 500; i ++ ) {
//
//     var mesh = new THREE.Mesh( geometry, material );
//
//     mesh.position.x = Math.random() * 10000 - 5000;
//     mesh.position.y = Math.random() * 10000 - 5000;
//     mesh.position.z = Math.random() * 10000 - 5000;
//
//     mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;
//
//     scene.add( mesh );
//
//     spheres.push( mesh );
//
//   }
//
//   // Skybox
//
//   var shader = THREE.ShaderLib[ "cube" ];
//   shader.uniforms[ "tCube" ].value = textureCube;
//
//   var material = new THREE.ShaderMaterial( {
//
//     fragmentShader: shader.fragmentShader,
//     vertexShader: shader.vertexShader,
//     uniforms: shader.uniforms,
//     depthWrite: false,
//     side: THREE.BackSide
//
//   } ),
//
//   mesh = new THREE.Mesh( new THREE.BoxGeometry( 100, 100, 100 ), material );
//   sceneCube.add( mesh );
//
//   //
//
//   renderer = new THREE.WebGLRenderer();
//   renderer.setPixelRatio( window.devicePixelRatio );
//   renderer.setSize( 640, 480 );
//   renderer.autoClear = false;
//   renderer.domElement.setAttribute('id', 'canvas');
//   container.append( renderer.domElement );
//
//   //
//
//   window.addEventListener( 'resize', onWindowResize, false );
//
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
//   cameraCube.aspect = 640/480;
//   cameraCube.updateProjectionMatrix();
//
//
//   renderer.setSize( 640, 480 );
//
// }
//
// function onDocumentMouseMove( event ) {
//
//   mouseX = ( event.clientX - 640 ) * 10;
//   mouseY = ( event.clientY - 480 ) * 10;
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
//   var timer = 0.0001 * Date.now();
//
//   for ( var i = 0, il = spheres.length; i < il; i ++ ) {
//
//     var sphere = spheres[ i ];
//
//     sphere.position.x = rx * Math.cos( timer + i );
//     sphere.position.y = ry * Math.sin( timer + i * 1.1 );
//
//   }
//
//   camera.position.x += ( mouseX - camera.position.x ) * 0.05;
//   camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
//
//   camera.lookAt( scene.position );
//   cameraCube.rotation.copy( camera.rotation );
//
//   renderer.render( sceneCube, cameraCube );
//   renderer.render( scene, camera );
//
// }
//
//
// $(document).on('readyForCanvas', function(event) {
//   console.log("readyForCanvas");
//   init();
//   animate();
//   $("#canvas").on( 'mousemove', onDocumentMouseMove );
// });
//
// $(document).on('rotationValueChanged', function(event, x, y) {
//   console.log('rotationValueChanged: ' + x + ', ' + y);
//   rx = x;
//   ry = y;
// });
