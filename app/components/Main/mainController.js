
'use strict';

var main = angular.module('ctMain', []);

main.controller('MainController', ['$scope', function($scope) {
  $(document).trigger('readyForCanvasRaycaster');
  $(document).trigger('readyForCanvas');
  $scope.files = [];
  $scope.activeFileIndex = 0;

  document.getElementById('files').addEventListener('change', function(evt) {
    console.log(evt);
    $scope.files.push(evt.target.files); // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li data-ng-click=changeActiveFile('+i+')><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
      f.size, '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    $scope.readFile();
  }, false);

  $scope.changeActiveFile = function(i) {
    $scope.activeFileIndex = i;
    $scope.readFile();
  }

  $scope.readFile = function() {

    if (!$scope.files.length) {
      alert('Please select a file!');
      return;
    }

    var file = $scope.files[$scope.activeFileIndex][0];
    var reader = new FileReader();

    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        window.arr = new Uint16Array(evt.target.result);
        $(document).trigger('selectedFileReadyForRaycast');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  $scope.onChangeCamera = function() {
    console.log("trigger");
    console.log($scope.camera);
    $(document).trigger("cameraChangeEvent", $scope.camera);
  }
}]);
