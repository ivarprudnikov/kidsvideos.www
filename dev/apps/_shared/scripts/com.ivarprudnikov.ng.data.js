'use strict';

/* globals angular */

(function (angular) {

  var mod = angular.module('com.ivarprudnikov.ng.data', [
    'com.ivarprudnikov.ng.config', 'ui.bootstrap'
  ]);

  mod.factory('PlaylistFactory', ['$resource', 'configuration', function ($resource, configuration) {

    return $resource(configuration.api.public.playlistPath + '/:action/:id', {}, {
      list : { method : 'GET', params : {action : 'list'} },
      show : { method : 'GET', params : {action : 'show'} },
      save : { method : 'POST', params : {action : 'save'} },
      update : { method : 'POST', params : {action : 'update', id : '@_id'} },
      delete : { method : 'POST', params : {action : 'delete', id : '@_id'} },
      addVideo : { method : 'POST', params : {action : 'addVideo'} },
      removeVideo : { method : 'POST', params : {action : 'removeVideo'} }
    });

  }]);

  mod.factory('VideoFactory', ['$resource', 'configuration', function ($resource, configuration) {

    return {

      search : $resource(configuration.api.public.videoSearch, {}, {
        getAll : { method : 'GET', cache : false }
      })

    };

  }]);



}(angular));

