'use strict';
/*Code forked and modified from a d3 example found at http://bl.ocks.org/Caged/6476579*/
import {loadShaders, updateCamera} from '../../threejs/raycaster.es6';
import Context from '../Context/context.es6';

var main = () => {

  document.getElementById('files').addEventListener('change', e => {
    var context = new Context();
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
        context.setProp('file', new Uint16Array(evt.target.result));
        loadShaders(context.getProps().file);  // start rendering
      }
    };

    reader.readAsArrayBuffer(file);
  }, false);

  document.getElementById('update_camera').addEventListener('click', (e) => {
    e.preventDefault();
    var cam = {};
    cam.x = $("#cam_x").val();
    cam.y = $("#cam_y").val();
    cam.z = $("#cam_z").val();
    updateCamera(cam);
  });
};

export default main;
