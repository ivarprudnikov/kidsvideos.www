'use strict';

var MODULE = angular.module('io.kidsvideos.www.video', [
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

    var APP_PATH = 'apps/home/scripts/modules/video';

    $stateProvider
    .state('video', {
             abstract : true,
             url      : '/video',
             template : '<div ui-view="videoview"></div>'
           })
    .state('video.landing', {
             url   : '/:id',
             views : {
               'videoview@video' : {
                 templateUrl : APP_PATH + '/views/landing.html',
                 controller  : 'MainController'
               }
             }
           })
  }
]);
