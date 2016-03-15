
'use strict';

var main = angular.module('ctMain', []);

main.controller('MainController', ['$scope', function($scope) {
  $(document).trigger('readyForCanvasRaycaster');
  $(document).trigger('readyForCanvas');

  // var randomdata = [];
  // for( var i = 0; i < 128; i++) {
  //   randomdata[i] = [];
  //   for( var j = 0; j < 128; j++) {
  //     randomdata[i][j] = [];
  //     for( var k = 0; k < 128; k++) {
  //       randomdata[i][j].push(Math.floor(Math.random()*4095));
  //     }
  //   }
  //   console.log("random data progress: " + i/128) + " %";
  // }
//  console.log("Hello mosaic");
//  $("#test").append(mosaic.createMosaicImage(128, 128, randomdata))
$scope.handleFileSelect = function(evt) {
  var files = evt.target.files; // FileList object

  // files is a FileList of File objects. List some properties.
  var output = [];
  for (var i = 0, f; f = files[i]; i++) {
    output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                '</li>');
  }
  document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

  readBlob(0,1);
}

document.getElementById('files').addEventListener('change', $scope.handleFileSelect, false);

$scope.readBlob = function(opt_startByte, opt_stopByte) {

  var files = document.getElementById('files').files;
  if (!files.length) {
    alert('Please select a file!');
    return;
  }

  var file = files[0];

  var reader = new FileReader();
  var arr;

  // If we use onloadend, we need to check the readyState.
  reader.onloadend = function(evt) {
    if (evt.target.readyState == FileReader.DONE) { // DONE == 2
      console.log(evt.target.result);
      arr = new Uint16Array(evt.target.result);
      console.log(arr);
      document.getElementById('byte').textContent += arr[0] + ", " + arr[1] + ", " + arr[2] + ", " + arr[3] + ", " + arr[4] + ", " + arr[5];
    }
  };
  reader.readAsArrayBuffer(file);
}
}]);

