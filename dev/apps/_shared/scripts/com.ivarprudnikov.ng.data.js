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
      }),
      item : $resource(configuration.api.public.videoCheck + '/:provider/:id', {}, {
        check : { method : 'POST' }
      })

    };

  }]);


  mod.factory('YoutubeVideoActivityFactory', ['VideoFactory', '$timeout', function (VideoFactory, $timeout) {

    /* jshint eqeqeq:false,eqnull:true */

    return {

      checkVideo : function (videoActivityObj, cb) {

        var item = videoActivityObj || {}, params = { id : item.id, provider : 'youtube'}, img = item.image && item.image.length ? item.image[item.image.length - 1].url : null, postBody = { title : item.displayName }, props = ['_id','isApproved', 'isSkipped', 'isPending'];

        if (item == null) {
          return cb('Video object is missing');
        }

        if (img != null) {
          postBody.imageUrl = img;
        }

        VideoFactory.item.check(params, postBody, function (responseData, responseHeaders) {
          $timeout(function () {
            for (var i = 0; i < props.length; i++) {
              item[props[i]] = responseData[props[i]];
            }
            cb(null, item);
          });
        }, function (httpResponse) {
          cb('Server error');
        });

      }
    };

  }]);



}(angular));

