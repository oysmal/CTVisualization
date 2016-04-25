import context from '../Context/context.es6';
import {loadShaders} from '../../threejs/raycaster.es6';

function setUpEvent() {
  $(document).on('new-file', (e) => {
    doThings();
  });
}

function doThings() {
  let props = context();
  console.log(props);
  let files = props.files;
  let elem = $('#file-list');

  for(let filename in files) {
    console.log(filename);
    let file = files[filename];
    elem.append('<li id="' + filename + '" class="list-group-item">' + filename + ' <button id="btn-'+filename+'" class="btn btn-primary">'+ filename + '</button></li>');
    $("#" + filename).on('click', () => {
      console.log("file "+ filename);
    });

    $('#btn-'+filename).on('click', () => {
      loadShaders(filename);
    });
  }
  setUpEvent();
}

export default doThings;
