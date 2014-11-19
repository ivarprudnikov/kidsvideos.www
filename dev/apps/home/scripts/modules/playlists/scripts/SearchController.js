'use strict';

angular.module('io.kidsvideos.www.playlists')
.controller(
'SearchController',
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

    searchForResults();

    function errorHandler(httpResponse) {
      loader.error(httpResponse);
    }

    function searchForResults() {
      loader.start();
      Restangular.one('user','guest').all('playlist').getList().then(function(response){
        $scope.results = response;
        loader.stop();
      }, errorHandler);
    }

    $scope.show = function(id){
      $state.go('^.show',{id:id});
    }

  }
]
);
