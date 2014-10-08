'use strict';

angular.module('io.kidsvideos.www.search')
.controller(
'SearchVideoController',
[
  'ManageVideoService',
  'VideoFactory',
  'YoutubeVideoActivityFactory',
  '$scope',
  '$interval',
  '$state',
  '$stateParams',
  'Loader',
  function (ManageVideoService, VideoFactory, YoutubeVideoActivityFactory, $scope, $interval, $state, $stateParams,
  Loader) {

    var loader = new Loader($scope, 'loadingMessage');
    $scope.types = {
      APPROVED : { name : 'Approved', key : 'APPROVED' },
      PENDING  : { name : 'Pending', key : 'PENDING' },
      SKIPPED  : { name : 'Skipped', key : 'SKIPPED' },
      YOUTUBE  : { name : 'Youtube', key : 'YOUTUBE' }
    };

    /* jshint camelcase:false */

    $scope.params = {};
    $scope.params.search_term = $stateParams.search_term || '';
    $scope.params.token = $stateParams.token || '';
    $scope.params.max = $stateParams.max || '';
    $scope.params.offset = $stateParams.offset || '';
    $scope.params.type = $scope.types[$stateParams.type] ? $scope.types[$stateParams.type].key : $scope.types.APPROVED.key;
    $scope.results = null;

    // check if should load results
    var isFresh = true;
    angular.forEach(Object.keys($stateParams),function(k){
      if(!angular.isUndefined($stateParams[k]))
        isFresh = false;
    });
    if(!isFresh){
      searchForResults();
    }

    function errorHandler(httpResponse) {
      loader.error(httpResponse);
    }

    function searchForResults() {
      loader.start();
      VideoFactory.search.getAll(
      $scope.params, null, function (responseData, responseHeaders) {
        $scope.results = responseData.data;
        loader.stop();
      }, errorHandler
      );
    }

    $scope.search = function () {
      $state.go($state.$current.name, $scope.params);
    };

    $scope.next = function () {
      if ($scope.results && $scope.results.links && $scope.results.links.next) {
        $state.go($state.$current.name, $scope.results.params.next);
      }
    };

    $scope.prev = function () {
      if ($scope.results && $scope.results.links && $scope.results.links.prev) {
        $state.go($state.$current.name, $scope.results.params.prev);
      }
    };

    $scope.previewVideo = function (id) {
      $scope.videoId = id;
    };

    $scope.closeVideo = function(){
      $scope.videoId = null;
    };

    $scope.addTo = function (itemIdx) {
      var item = $scope.results.items[itemIdx];
      ManageVideoService.addVideo(item);
    };

    $scope.loadNextId = function (currentlyPlayingId) {
      setNextVideoId(currentlyPlayingId);
    };
    $scope.loadPreviousId = function (currentlyPlayingId) {
      setPreviousVideoId(currentlyPlayingId);
    };

    function setNextVideoId(currentId) {

      var lastIdx = $scope.results.items.length - 1;
      var itemFound = false;

      angular.forEach($scope.results.items, function (val, idx) {
        if (val && val.id && val.id === currentId) {
          if (idx === lastIdx) {
            $scope.videoId = $scope.results.items[0].id;
          } else {
            $scope.videoId = $scope.results.items[idx + 1].id;
          }
          itemFound = true;
        }
      });

      if (!itemFound) {
        $scope.videoId = $scope.results.items[0].id;
      }
    }

    function setPreviousVideoId(currentId) {

      var lastIdx = $scope.results.items.length - 1;
      var itemFound = false;

      angular.forEach($scope.results.items, function (val, idx) {
        if (val && val.id && val.id === currentId) {
          if (idx === 0) {
            $scope.videoId = $scope.results.items[lastIdx].id;
          } else {
            $scope.videoId = $scope.results.items[idx - 1].id;
          }
          itemFound = true;
        }
      });

      if (!itemFound) {
        $scope.videoId = $scope.results.items[0].id;
      }
    }

    $scope.$on(
    '$destroy', function () {
    }
    );

  }
]
);
