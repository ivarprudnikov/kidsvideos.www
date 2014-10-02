'use strict';

angular.module(
'io.kidsvideos.admin.main', [
  'com.ivarprudnikov.ng.config',
  'com.ivarprudnikov.ng.youtube',
  'com.ivarprudnikov.ng.validation',
  'com.ivarprudnikov.ng.search',
  'com.ivarprudnikov.ng.auth',
  'com.ivarprudnikov.ng.data',
  'com.ivarprudnikov.ng.video.manage',
  'ui.router', 'ui.bootstrap', 'ngResource', 'ngAnimate', 'ui.keypress', 'ui.event', 'ngTouch', 'appTemplates'
]
).run(
function ($rootScope, $timeout, $window, $location, authService, $urlRouter, configuration) {

  $rootScope.menuIsActive = true;

  $rootScope.currentState = { name : '' };

  $rootScope.$on(
  '$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    if (toState && toState.data && toState.data.requireAuth && !authService.hasToken()) {
      event.preventDefault();
      authService.login().success(
      function () {
        $urlRouter.sync();
      }
      ).error(
      function () {
        $window.location.replace(configuration.app.baseUrl);
      }
      );
    } else {
      $rootScope.currentState.name = toState.name.replace(/\./g, '_');
      $('body').animate({ scrollTop : 0 }, 100);
    }
  }
  );
}
).config(
[
  '$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    var APP_PATH = 'apps/main/';

    $urlRouterProvider.otherwise('/main');

    $stateProvider.state(
    'main', {
      url      : '/main',
      abstract : true,
      data     : {
        requireAuth : true
      }
    }
    ).state(
    'main.home', {
      url   : '',
      views : {
        'main@' : {
          templateUrl : APP_PATH + 'views/main.home.html',
          controller  : 'HomeController'
        }
      }
    }
    ).state(
    'video', {
      url      : '/video',
      abstract : true,
      data     : {
        requireAuth : true
      }
    }
    ).state(
    'video.search', {
      url   : '/search?search_term&token&max&offset&type',
      views : {
        'main@' : {
          templateUrl : APP_PATH + 'views/video.search.html',
          controller  : 'VideoController'
        }
      }
    }
    ).state(
    'playlist', {
      url      : '/playlist',
      abstract : true,
      data     : {
        requireAuth : true
      }
    }
    ).state(
    'playlist.list', {
      url   : '/list?query&max&offset&sort&order&isPublic&isApproved&isSkipped&isPending&user',
      views : {
        'main@' : {
          templateUrl : APP_PATH + 'views/playlist.list.html',
          controller  : 'PlaylistListController'
        }
      }
    }
    ).state(
    'playlist.show', {
      url   : '/show/:id',
      views : {
        'main@' : {
          templateUrl : APP_PATH + 'views/playlist.show.html',
          controller  : 'PlaylistShowController'
        }
      }
    }
    ).state(
    'playlist.create', {
      url   : '/create',
      views : {
        'main@' : {
          templateUrl : APP_PATH + 'views/playlist.create.html',
          controller  : 'PlaylistCreateController'
        }
      }
    }
    ).state(
    'playlist.edit', {
      url   : '/edit/:id',
      views : {
        'main@' : {
          templateUrl : APP_PATH + 'views/playlist.edit.html',
          controller  : 'PlaylistEditController'
        }
      }
    }
    );
  }
]
);
