'use strict';

angular.module('io.kidsvideos.www.video')
.controller(
'MainController',
[
  'ManageVideoService',
  'VideoFactory',
  'YoutubeVideoActivityFactory',
  '$scope',
  '$interval',
  '$state',
  '$stateParams',
  'Loader',
  'Restangular',
  function (ManageVideoService, VideoFactory, YoutubeVideoActivityFactory, $scope, $interval, $state, $stateParams,
  Loader, Restangular) {

    var loader = new Loader($scope, 'loadingMessage');

    /* jshint camelcase:false */

    $scope.params = {};
    $scope.params.id = $stateParams.id || '';
    $scope.params.provider = $stateParams.provider || '';
    $scope.result = null;

    loadVideo();

    function errorHandler(httpResponse) {
      loader.error(httpResponse);
    }

    function loadVideo() {
      loader.start();
      Restangular.one('video',$stateParams.id).get().then(function(video){
        $scope.result = video;
        console.log(video)
        loader.stop();
      }, errorHandler);
    }

  }
]
);
