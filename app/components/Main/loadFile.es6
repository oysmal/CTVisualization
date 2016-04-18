'use strict';
import {loadShaders, updateCamera} from '../../threejs/raycaster.es6';

var main = () => {

  console.log(loadShaders);

  document.getElementById('files').addEventListener('change', e => {
    var files = e.target.files;
    console.log("change files");

    if (!files.length) {
      alert('Please select a file!');
      return;
    }

    var file = files[0];
    var reader = new FileReader();

    reader.onloadend = (evt) => {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        window.arr = new Uint16Array(evt.target.result);
        console.log(loadShaders);
        loadShaders(window.arr);  // start rendering
      }
    };

    reader.readAsArrayBuffer(file);
  }, false);

  document.getElementById('update_camera').addEventListener('click', (e) => {
    e.preventDefault();
    console.log("updateCam");
    var cam = {};
    cam.x = $("#cam_x").val();
    cam.y = $("#cam_y").val();
    cam.z = $("#cam_z").val();
    updateCamera(cam);
  });
};

export default main;
