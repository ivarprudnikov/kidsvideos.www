'use strict';

var MODULE = angular.module('io.kidsvideos.www.personal', [
  'com.ivarprudnikov.ng.config',
  'com.ivarprudnikov.ng.sidebar',
  'com.ivarprudnikov.ng.youtube',
  'com.ivarprudnikov.ng.validation',
  'com.ivarprudnikov.ng.search',
  'com.ivarprudnikov.ng.auth',
  'com.ivarprudnikov.ng.data',
  'com.ivarprudnikov.ng.video.manage',
  'ui.router', 'ui.bootstrap', 'ngResource', 'ngAnimate', 'ui.keypress', 'ui.event', 'appTemplates', 'ngTouch'
]);

MODULE.config(
[
  '$stateProvider',
  function ($stateProvider) {

    var APP_PATH = 'apps/home/scripts/modules/personal';

    $stateProvider
    .state('personal', {
       abstract : true,
       url      : '/personal',
       template : '<div ui-view="personal"></div>'
    }).state('personal.landing', {
       url   : '?query&max&offset&sort&order&isPublic',
       views : {
         'personal@personal' : {
           templateUrl : APP_PATH + '/views/landing.html',
           controller  : 'PlaylistListController'
         }
       }
     }
    ).state(
    'personal.show', {
      url   : '/show/:id',
      views : {
        'personal@personal' : {
          templateUrl : APP_PATH + '/views/playlist.show.html',
          controller  : 'PlaylistShowController'
        }
      }
    }
    ).state(
    'personal.create', {
      url   : '/create',
      views : {
        'personal@personal' : {
          templateUrl : APP_PATH + '/views/playlist.create.html',
          controller  : 'PlaylistCreateController'
        }
      }
    }
    ).state(
    'personal.edit', {
      url   : '/edit/:id',
      views : {
        'personal@personal' : {
          templateUrl : APP_PATH + '/views/playlist.edit.html',
          controller  : 'PlaylistEditController'
        }
      }
    }
    );
  }
]);
