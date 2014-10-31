'use strict';

angular.module('io.kidsvideos.www.search')
.controller(
'SearchLandingController',
[
  'ManageVideoService',
  'VideoFactory',
  'YoutubeVideoActivityFactory',
  '$scope',
  '$interval',
  '$state',
  function (ManageVideoService, VideoFactory, YoutubeVideoActivityFactory, $scope, $interval, $state ) {

    $scope.types = {
      YOUTUBE  : { name : 'Youtube', key : 'YOUTUBE' },
      APPROVED : { name : 'Approved', key : 'APPROVED' },
      PENDING  : { name : 'Pending', key : 'PENDING' }
    };

    /* jshint camelcase:false */

    $scope.params = {
      search_term:'',
      token: '',
      max: 20,
      offset: 0,
      type: $scope.types.YOUTUBE.key
    };

    $scope.isAdvancedVisible = false;

    $scope.search = function () {
      $state.go('^.results', $scope.params);
    };

    $scope.toggleAdvanced = function(){
      $scope.isAdvancedVisible = !$scope.isAdvancedVisible;
    };

  }
]
);
