'use strict';

/* App Module */

var phonecatApp = angular.module('svalbardApp', [
  'ngRoute',
  'svalbardMain',
]);

phonecatApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'components/Main/main.html',
        controller: 'MainController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);
