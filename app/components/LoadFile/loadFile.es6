import context from '../Context/context.es6';
import Mosaic from '../../threejs/utils/createMosaicImage.es6';

let data = null;

export default function() {
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
        data = new Uint16Array(evt.target.result);
        createImage(file.name.split('\.')[0]);
      }
    };

    reader.readAsArrayBuffer(file);
  }, false);
}

function createImage(name) {
  let props = context();
  let m = new Mosaic();
  props.files[name] = {'data': data};
  props.image_arrays[name] = [];
  m.createMosaicImage(name, data, (canvas) => {
    props.files[name].tex = new THREE.Texture(canvas);
    $(document).trigger('new-file', {});
  });
}
