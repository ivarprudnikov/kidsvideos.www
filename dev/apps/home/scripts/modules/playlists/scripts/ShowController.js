'use strict';

angular.module('io.kidsvideos.www.playlists')
.controller(
'ShowController',
[
  'Restangular',
  '$scope',
  '$interval',
  '$state',
  '$stateParams',
  'Loader',
  function (Restangular, $scope, $interval, $state, $stateParams,
  Loader) {

    var loader = new Loader($scope, 'loadingMessage');

    $scope.id = $stateParams.id || '';
    $scope.result = null;

    $scope.$watch(
      $stateParams, function () {
        loadPlaylist();
      }
    );

    function errorHandler(httpResponse) {
      loader.error(httpResponse);
    }

    function loadPlaylist() {
      if ($scope.id) {
        loader.start();
        Restangular.one('user','guest').one('playlist',$scope.id).get().then(function(response){
          $scope.result = response;
          loader.stop();
        }, errorHandler);
      }
    }

  }
]
);
