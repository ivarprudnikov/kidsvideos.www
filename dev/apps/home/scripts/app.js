'use strict';

var APP = angular.module(
'io.kidsvideos.www', [
  'com.ivarprudnikov.ng.config',
  'com.ivarprudnikov.ng.sidebar',
  'com.ivarprudnikov.ng.auth',
  'ui.router',
  'ui.bootstrap',
  'appTemplates'
]
);

function AppRunner($rootScope, $urlRouter, $window, authService, configuration) {
  $rootScope.$on(
  '$stateChangeStart',
  function (event, toState, toParams, fromState, fromParams) {
    if (toState && toState.data && toState.data.requireAuth && !authService.hasToken()) {
      event.preventDefault();
      authService.login().success(function () {
        $urlRouter.sync();
      }).error(function () {
        $window.location.replace(configuration.app.home);
      });
    }

  }
  );

  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    console.error(error);
  });

  $rootScope.$on('$stateNotFound', function (event, unfoundState, fromState, fromParams) {
    console.error(unfoundState);
  });
}

function AppConfig($stateProvider, $urlRouterProvider) {

  var VIEWS_PATH = 'apps/home/views/';

  $urlRouterProvider.otherwise('/');

  $stateProvider.state('landing', {
    url         : '/',
    templateUrl : VIEWS_PATH + 'landing.html',
    controller  : [
      '$state', '$scope', function ($state, $scope) {
      }
    ]
  });

}

APP.run(['$rootScope','$urlRouter','$window','authService','configuration',AppRunner]);
APP.config(['$stateProvider', '$urlRouterProvider', AppConfig]);
