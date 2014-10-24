'use strict';

angular.module('io.kidsvideos.www.personal')
  .controller('PlaylistEditController', ['$window', '$interval', '$scope', '$state', '$stateParams', 'PlaylistFactory',
    function ($window, $interval, $scope, $state, $stateParams, PlaylistFactory) {

      var messageInterval = null,
        msg0 = 'Loading playlist',
        msg1 = 'Still loading',
        msg2 = 'Takes longer than usual',
        msgErr = 'Error occured while loading playlist';

      $scope.id = $stateParams.id || '';

      $scope.loadingMessage = '';
      $scope.playlist = null;

      $scope.$watch($stateParams, function () {
        loadPlaylist();
      });

      function stopMessageInterval() {
        if (angular.isDefined(messageInterval)) {
          $scope.loadingMessage = '';
          $interval.cancel(messageInterval);
        }
      }

      function startLoadingMessage() {
        $scope.loadingMessage = msg0;
        messageInterval = $interval(function () {
          if ($scope.loadingMessage === msg0) {
            $scope.loadingMessage = msg1;
          } else if ($scope.loadingMessage === msg1) {
            $scope.loadingMessage = msg2;
          } else {
            $scope.loadingMessage += '.';
          }
        }, 7000);
      }

      function errorHandler(httpResponse) {
        stopMessageInterval();
        $scope.loadingMessage = msgErr;
      }

      function loadPlaylist() {
        if ($scope.id) {
          startLoadingMessage();
          $scope.playlist = PlaylistFactory.show({id : $scope.id}, null, function (responseData, responseHeaders) {
            stopMessageInterval();
          }, errorHandler);
        }
      }

      $scope.submittingData = false;

      $scope.update = function (formController) {

        $scope.submittingData = true;

        var playlistClone = _.clone($scope.playlist);

        PlaylistFactory.update({}, playlistClone, function (palylistInstance) {
          $scope.playlist = _.clone(palylistInstance);
          $scope.playlistform.$setPristine();
          $scope.submittingData = false;

          $state.go('^.show', {id : palylistInstance._id});
        }, function () {
          $scope.submittingData = false;
          console.error('Error occured');
        });

      };

      $scope.delete = function (formController) {

        $scope.submittingData = true;

        var playlistClone = _.clone($scope.playlist);

        PlaylistFactory.delete({id:playlistClone._id}, null, function () {
          $scope.submittingData = false;
          $state.go('^.list');
        }, function () {
          $scope.submittingData = false;
          $window.alert('Error occured');
        });

      };

      $scope.$on('$destroy', function () {
      });

    }]);
