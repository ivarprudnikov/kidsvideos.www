'use strict';

var MODULE = angular.module('io.kidsvideos.www.playlists', [
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

    var APP_PATH = 'apps/home/scripts/modules/playlists';

    $stateProvider
        .state('playlists', {
             abstract : true,
             url      : '/playlists',
             template : '<div ui-view="playlists"></div>'
           })
        .state('playlists.landing', {
             url   : '',
             views : {
               'playlists@playlists' : {
                 templateUrl : APP_PATH + '/views/landing.html',
                 controller  : 'SearchController'
               }
             }
           })
        .state('playlists.show', {
            url   : '/:id',
            views : {
              'playlists@playlists' : {
                templateUrl : APP_PATH + '/views/show.html',
                controller  : 'ShowController'
              }
            }
          })
  }
]);
