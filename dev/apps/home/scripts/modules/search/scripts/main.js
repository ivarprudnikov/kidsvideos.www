'use strict';

var MODULE = angular.module('io.kidsvideos.www.search', [
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

    var APP_PATH = 'apps/home/scripts/modules/search';

    $stateProvider
    .state('search', {
             abstract : true,
             url      : '/search',
             template : '<div ui-view="searchview"></div>'
           })
    .state('search.landing', {
             url   : '',
             views : {
               'searchview@search' : {
                 templateUrl : APP_PATH + '/views/landing.html',
                 controller  : 'SearchLandingController'
               }
             }
           })
    .state('search.results', {
             url   : '/results?search_term&token&max&offset&type',
             views : {
               'searchview@search' : {
                 templateUrl : APP_PATH + '/views/results.html',
                 controller  : 'SearchVideoController'
               }
             }
           })
  }
]);
