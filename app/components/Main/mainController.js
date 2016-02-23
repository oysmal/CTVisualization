
'use strict';

var main = angular.module('svalbardMain', []);

main.controller('MainController', ['$scope', function($scope) {
  $(document).trigger('readyForCanvas');

  $scope.updateRotation = function() {
    console.log("onClickRotationChanged");
    $(document).trigger('rotationValueChanged', [parseInt($scope.rotation.x), parseInt($scope.rotation.y)]);
  };
}]);
