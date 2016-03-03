
'use strict';

var main = angular.module('ctMain', []);

main.controller('MainController', ['$scope', function($scope) {
  $(document).trigger('readyForCanvasRaycaster');

  $scope.updateRotation = function() {
    console.log("onClickRotationChanged");
    $(document).trigger('rotationValueChanged', [parseInt($scope.rotation.x), parseInt($scope.rotation.y)]);
  };
}]);
