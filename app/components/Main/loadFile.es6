'use strict';
import {loadShaders, updateCamera} from '../../threejs/raycaster.es6';
import $ from '../../../bower_components/jquery/dist/jquery.min.js';

var main = () => {

  console.log(loadShaders);

  $('#files').on('change', (e) => {
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
        loadShaders();  // start rendering
      }
    };

    reader.readAsArrayBuffer(file);
  }, false);

  $("#update_camera").on("click", () => {
    console.log("updateCam");
    var cam = [];
    cam.push($("#cam_x").val());
    cam.push($("#cam_y").val());
    cam.push($("#cam_z").val());
    updateCamera(cam);
  });
};

export default main;
