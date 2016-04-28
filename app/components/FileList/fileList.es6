import context from '../Context/context.es6';
import {loadShaders} from '../../threejs/raycaster.es6';

function setUpEvent() {
  $(document).on('new-file', (e) => {
    doThings();
  });
}

function doThings() {
  let props = context();
  let files = props.files;
  let elem = $('#file-list');
  elem.empty();

  for(let filename in files) {
    let file = files[filename];
    elem.append('<li id="' + filename + '" class="file-item row"><span class="col-sm-9">Data file: ' + filename + ' </span><button id="btn-'+filename+'" class="btn btn-primary col-sm-3">Render</button></li>');

    $('#btn-'+filename).on('click', () => {
      loadShaders(filename);
    });
  }
  setUpEvent();
}

export default doThings;
