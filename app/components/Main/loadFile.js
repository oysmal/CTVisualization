'use strict';
import raycaster from '../../threejs/raycaster.js';
import $ from '../../../bower_components/jquery/dist/jquery.min.js';

var main = function() {

  $(document).trigger('readyForCanvasRaycaster');
  $(document).trigger('readyForCanvas');

  document.getElementById('files').addEventListener('change', function(e) {
    var files = e.target.files;

    if (!files.length) {
      alert('Please select a file!');
      return;
    }

    var file = files[0];
    var reader = new FileReader();

    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        window.arr = new Uint16Array(evt.target.result);
        $(document).trigger('selectedFileReadyForRaycast');
      }
    };

    reader.readAsArrayBuffer(file);
  }, false);

  $("#update_camera").on("click", function() {
    console.log("trigger");
    var cam = [];
    cam.push($("#cam_x").val());
    cam.push($("#cam_y").val());
    cam.push($("#cam_z").val());
    $(document).trigger("cameraChangeEvent", cam);
  });
};

export default function()  {
  //$("#main").addEventListener('load', function() {main();});
  console.log("Hi");
};
