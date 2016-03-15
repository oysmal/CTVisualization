
'use strict';

var main = angular.module('ctMain', []);

main.controller('MainController', ['$scope', function($scope) {
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

  $scope.onChangeCamera = function() {
    console.log("trigger");
    console.log($scope.camera);
    $(document).trigger("cameraChangeEvent", $scope.camera);
  }
}]);
