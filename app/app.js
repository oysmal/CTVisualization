'use strict';

/* App Module */

var ctApp = angular.module('ctApp', [
  'ngRoute',
  'ctMain',
]);

ctApp.config(['$routeProvider',
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
