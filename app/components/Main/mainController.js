
'use strict';

var main = angular.module('ctMain', []);

main.controller('MainController', ['$scope', function($scope) {
  $(document).trigger('readyForCanvasRaycaster');

  $scope.updateRotation = function() {
    console.log("onClickRotationChanged");
    $(document).trigger('rotationValueChanged', [parseInt($scope.rotation.x), parseInt($scope.rotation.y)]);
  };

  var randomdata = [];
  for( var i = 0; i < 20; i++) {
    randomdata[i] = [];
    for( var j = 0; j < 100; j++) {
      randomdata[i][j] = [];
      for( var k = 0; k < 100; k++) {
        randomdata[i][j].push(Math.floor(Math.random()*4096));
      }
    }
  }
  console.log("Hello mosaic");
  $("#test").append(mosaic.createMosaicImage(100, 100, randomdata));
}]);
