'use strict';

angular.module('io.kidsvideos.admin.main')
.controller(
'HomeController', [
  '$scope', '$rootScope', '$timeout', 'StatisticsFactory',
  function ($scope, $rootScope, $timeout, StatisticsFactory) {

    StatisticsFactory.getAll(
    {}, function (responseData, responseHeaders) {

      $scope.videosApproved = responseData.videosApproved;
      $scope.videosSkipped = responseData.videosSkipped;
      $scope.videosPending = responseData.videosPending;
      $scope.videosTotal = responseData.videosTotal;
      $scope.playlistsApproved = responseData.playlistsApproved;
      $scope.playlistsSkipped = responseData.playlistsSkipped;
      $scope.playlistsPending = responseData.playlistsPending;
      $scope.playlistsPublic = responseData.playlistsPublic;
      $scope.playlistsTotal = responseData.playlistsTotal;

    }, function (httpResponse) {
      console.log('err', httpResponse);
    }
    );

    $scope.$on(
    '$destroy', function () {
    }
    );

  }
]
);
