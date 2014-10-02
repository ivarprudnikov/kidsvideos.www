'use strict';

angular.module('io.kidsvideos.admin.main')
.controller(
'PlaylistShowController', [
  '$scope', '$state', '$stateParams', '$interval', 'PlaylistFactory',
  function ($scope, $state, $stateParams, $interval, PlaylistFactory) {

    var messageInterval = null,
        msg0 = 'Loading playlist',
        msg1 = 'Still loading',
        msg2 = 'Takes longer than usual',
        msgErr = 'Error occured while loading playlist';

    $scope.id = $stateParams.id || '';

    $scope.loadingMessage = '';
    $scope.playlist = null;

    $scope.$watch(
    $stateParams, function () {
      loadPlaylist();
    }
    );

    function stopMessageInterval() {
      if (angular.isDefined(messageInterval)) {
        $scope.loadingMessage = '';
        $interval.cancel(messageInterval);
      }
    }

    function startLoadingMessage() {
      $scope.loadingMessage = msg0;
      messageInterval = $interval(
      function () {
        if ($scope.loadingMessage === msg0) {
          $scope.loadingMessage = msg1;
        } else if ($scope.loadingMessage === msg1) {
          $scope.loadingMessage = msg2;
        } else {
          $scope.loadingMessage += '.';
        }
      }, 7000
      );
    }

    function errorHandler(httpResponse) {
      stopMessageInterval();
      $scope.loadingMessage = msgErr;
    }

    function loadPlaylist() {
      if ($scope.id) {
        startLoadingMessage();
        $scope.playlist = PlaylistFactory.show(
        {id : $scope.id}, null, function (responseData, responseHeaders) {
          stopMessageInterval();
        }, errorHandler
        );
      }
    }

    $scope.removeFromPlaylist = function (itemIdx) {
      var video = $scope.playlist.videos[itemIdx];
      var queryParams = {id : $scope.playlist._id};
      var postData = {videoId : video._id};
      PlaylistFactory.removeVideo(
      queryParams, postData, function (responseData, responseHeaders) {
        loadPlaylist();
      }, function (err) {
        $scope.loadingMessage = err;
      }
      );
    };

    function setNextVideoId(currentId) {

      var lastIdx = $scope.playlist.videos.length - 1;
      var itemFound = false;

      angular.forEach($scope.playlist.videos, function (val, idx) {
        if (val && val.id && val.id === currentId) {
          if (idx === lastIdx) {
            $scope.videoId = $scope.playlist.videos[0].id;
          } else {
            $scope.videoId = $scope.playlist.videos[idx + 1].id;
          }
          itemFound = true;
        }
      });

      if (!itemFound) {
        $scope.videoId = $scope.playlist.videos[0].id;
      }
    }

    function setPreviousVideoId(currentId) {

      var lastIdx = $scope.playlist.videos.length - 1;
      var itemFound = false;

      angular.forEach($scope.playlist.videos, function (val, idx) {
        if (val && val.id && val.id === currentId) {
          if (idx === 0) {
            $scope.videoId = $scope.playlist.videos[lastIdx].id;
          } else {
            $scope.videoId = $scope.playlist.videos[idx - 1].id;
          }
          itemFound = true;
        }
      });

      if (!itemFound) {
        $scope.videoId = $scope.playlist.videos[0].id;
      }
    }

    $scope.showYoutubeVideo = function (videoId) {
      $scope.videoId = videoId;
    };
    $scope.loadNextId = function (currentlyPlayingId) {
      setNextVideoId(currentlyPlayingId);
    };
    $scope.loadPreviousId = function (currentlyPlayingId) {
      setPreviousVideoId(currentlyPlayingId);
    };

    $scope.$on(
    '$destroy', function () {
    }
    );

  }
]
);
