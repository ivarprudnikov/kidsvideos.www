'use strict';

var APP = angular.module(
'io.kidsvideos.www', [
  'io.kidsvideos.www.search',
  'io.kidsvideos.www.video',
  'io.kidsvideos.www.personal',
  'com.ivarprudnikov.ng.config',
  'com.ivarprudnikov.ng.sidebar',
  'com.ivarprudnikov.ng.youtube',
  'com.ivarprudnikov.ng.validation',
  'com.ivarprudnikov.ng.search',
  'com.ivarprudnikov.ng.auth',
  'com.ivarprudnikov.ng.data',
  'com.ivarprudnikov.ng.video.manage',
  'ui.router', 'ui.bootstrap', 'ngResource', 'ngAnimate', 'ui.keypress', 'ui.event', 'appTemplates'
]
);

function AppRunner($rootScope, $urlRouter, $window, authService, configuration) {

  $rootScope.currentState = { name : '' };

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
    } else {
      $rootScope.currentState.name = toState.name.replace(/\./g, '_');
      $('body').animate({ scrollTop : 0 }, 100);
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

function AppConfig($stateProvider, $urlRouterProvider, $locationProvider) {

  //$locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');

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
APP.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', AppConfig]);
