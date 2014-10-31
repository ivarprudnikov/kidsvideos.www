'use strict';

/* globals angular */

(function (angular) {

  var mod = angular.module('com.ivarprudnikov.ng.data', [
    'com.ivarprudnikov.ng.config', 'ui.bootstrap', 'restangular'
  ]);

  mod.config(['RestangularProvider', 'configuration', function(RestangularProvider, configuration) {

    RestangularProvider.setBaseUrl(configuration.api.baseUrl + configuration.api.public.path);

    RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
      var extractedData;
      if(operation === "getList") {
        if (data.data !== undefined) {
          extractedData = data.data;
          extractedData.max = data.max;
          extractedData.total = data.total;
          extractedData.offset = data.offset;
        } else if (data.items !== undefined) {
          extractedData = data.items;
          extractedData.command = data.command;
          extractedData.total = data.totalItems;
          extractedData.max = data.itemsPerPage;
          extractedData.offset = data.startIndex;
          extractedData.activityStream = data;
        }

      } else {
        if(data.data !== undefined){
          extractedData = data.data;
        }
      }
      return extractedData;
    });

    // using mongo
    RestangularProvider.setRestangularFields({ id: "_id" });


    // TODO https://github.com/mgonto/restangular#seterrorinterceptor
    RestangularProvider.setErrorInterceptor(function(response, deferred, responseHandler) {
      if(response.status === 400) {
        console.error('error 400')
        return false; // error handled
      }
      return true; // error not handled
    });

  }]);


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
      item : $resource(configuration.api.public.video + '/:action/:provider/:id', {}, {
        get : { method : 'GET', cache : false },
        check : { method : 'POST', params : {action:'check'} }
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

