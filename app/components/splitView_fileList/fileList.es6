import context from '../Context/context.es6';
import {loadShaders} from '../../threejs/splitviewcaster.es6';

let hasSetupEvent = false;

function setUpEvent() {
  $(document).on('new-split-file', (e) => {
    doThings();
  });
}

function prepareOnCheckEvents() {
  $(".checkbox").change(function() {
    let filenames = [];

    $('input:checked').each(function() {
      filenames.push($(this).val());
    });

    if (filenames.length == 2) {
      let elem = $('#file-list');
      elem.append('<li id="renderButtonHolder" class="file-item row"><button style="margin-top:25px;" id="btn-renderSplit" class="btn btn-default col-sm-3">Render</button></li>');

      $('#btn-renderSplit').on('click', () => {
        loadShaders(filenames);
      });

    } else {
      $('#renderButtonHolder').remove();
    }
  });
}

function doThings() {
  let props = context();
  let files = props.files;
  let elem = $('#file-list');
  elem.empty();

  for(let filename in files) {
    elem.append('<li id="' + filename + '" class="file-item row"><span class="col-sm-9">Data file: ' + filename + ' </span><input type="checkbox" class="checkbox" value="'+filename+'"/></li>');
  }

  if (!hasSetupEvent) {
    setUpEvent();
    hasSetupEvent = true;
  }

  prepareOnCheckEvents();
}

export default doThings;
