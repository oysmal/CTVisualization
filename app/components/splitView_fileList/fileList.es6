import context from '../Context/context.es6';
import {loadShaders} from '../../threejs/splitviewcaster.es6';

let hasSetupEvent = false;

function setUpEvent() {
  $(document).on('new-split-file', (e) => {
    doThings();
  });
}

function doThings() {
  let props = context();
  let files = props.files;
  let elem = $('#file-list');
  elem.empty();
  let filenames = [];
  let items = 0;

  for(let filename in files) {
    filenames.push(filename);
    items++;

    let file = files[filename];
    elem.append('<li id="' + filename + '" class="file-item row"><span class="col-sm-9">Data file: ' + filename + ' </span></li>');
  }

  if (filenames.length == 2) {
    elem.append('<li style="margin-top:15px;"><button id="btn-renderSplit" class="btn btn-primary col-sm-3">Render</button></li>');
    $('#btn-renderSplit').on('click', () => {
        loadShaders(filenames);
      });
  }
  if (!hasSetupEvent) {
    setUpEvent();
    hasSetupEvent = true;
  }
}

export default doThings;
