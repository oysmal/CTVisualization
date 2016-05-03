import context from '../Context/context.es6';
let props = context();
let elem = null;

export default function() {
  elem = $('<div id="load-ini-file-container"></div>');
  $('.main_container').append(elem);
  elem.load('components/LoadIniFile/loadIniFile.html', () => {
    document.getElementById('ini-file-input').addEventListener('change', e => {
      var files = e.target.files;

      if (!files.length) {
        alert('Please select a file!');
        return;
      }

      var file = files[0];
      var reader = new FileReader();

      // read the ini file
      reader.onloadend = (evt) => {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
          let data = evt.target.result.split("\n");
          let x = parseFloat(data[1].split('=')[1], 10);
          let y = parseFloat(data[2].split('=')[1], 10);
          let z = parseFloat(data[3].split('=')[1], 10);
          console.log("x: "+x+", y: " + y+ ", z: " + z);
          let name = file.name.split('\.')[0];
          props.files[name].scale_x = x;
          props.files[name].scale_y = y;
          props.files[name].scale_z = z;

          // remove the modal
          elem.remove();
        }
      };
      reader.readAsText(file);
    }, false);

    // remove the modal if button is clicked
    $('#no-ini-file').on('click', (e) => {
      elem.remove();
    });
  });
}
