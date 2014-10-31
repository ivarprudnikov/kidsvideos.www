'use strict';

angular.module('io.kidsvideos.www.search')
.controller(
'SearchVideoController',
[
  'Restangular',
  'ManageVideoService',
  '$scope',
  '$interval',
  '$state',
  '$stateParams',
  'Loader',
  function (Restangular, ManageVideoService, $scope, $interval, $state, $stateParams,
  Loader) {

    var loader = new Loader($scope, 'loadingMessage');
    $scope.types = {
      YOUTUBE  : { name : 'Youtube', key : 'YOUTUBE' },
      APPROVED : { name : 'Approved', key : 'APPROVED' },
      PENDING  : { name : 'Pending', key : 'PENDING' }
    };

    /* jshint camelcase:false */

    $scope.params = {};
    $scope.params.search_term = $stateParams.search_term || '';
    $scope.params.token = $stateParams.token || '';
    $scope.params.max = $stateParams.max || '';
    $scope.params.offset = $stateParams.offset || '';
    $scope.params.type = $scope.types[$stateParams.type] ? $scope.types[$stateParams.type].key : $scope.types.APPROVED.key;
    $scope.results = null;
    $scope.isAdvancedVisible = false;

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
      Restangular.all('search').getList($scope.params).then(function(response){
        $scope.results = response;
        loader.stop();
      }, errorHandler);
    }

    $scope.search = function () {
      $state.go($state.$current.name, $scope.params);
    };

    $scope.toggleAdvanced = function(){
      $scope.isAdvancedVisible = !$scope.isAdvancedVisible;
    };

    $scope.next = function () {
      if ($scope.results && $scope.results.activityStream.links && $scope.results.activityStream.links.next) {
        $state.go($state.$current.name, $scope.results.activityStream.params.next);
      }
    };

    $scope.prev = function () {
      if ($scope.results && $scope.results.activityStream.links && $scope.results.activityStream.links.prev) {
        $state.go($state.$current.name, $scope.results.activityStream.params.prev);
      }
    };

    $scope.playVideo = function (id) {
      $scope.videoId = id;
    };

    $scope.previewVideo = function (itemIdx) {
      var item = $scope.results[itemIdx];
      if(item._id){
        $state.go('video.landing',{id:item._id})
      } else {
        Restangular.all('video').post(item).then(function(newItem){
          $state.go('video.landing',{id:newItem._id})
        });
      }
    };

    $scope.closeVideo = function(){
      $scope.videoId = null;
    };

    $scope.addTo = function (itemIdx) {
      var item = $scope.results[itemIdx];
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
