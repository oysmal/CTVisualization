
'use strict';

var main = angular.module('ctMain', []);

main.controller('MainController', ['$scope', function($scope) {
  $(document).trigger('readyForCanvasRaycaster');

  $scope.updateRotation = function() {
    console.log("onClickRotationChanged");
    $(document).trigger('rotationValueChanged', [parseInt($scope.rotation.x), parseInt($scope.rotation.y)]);
  };

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
//  $("#test").append(mosaic.createMosaicImage(128, 128, randomdata));
}]);
