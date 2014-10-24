'use strict';

angular.module('io.kidsvideos.www.personal')
  .controller('PlaylistCreateController', ['$scope', '$state', '$stateParams', 'PlaylistFactory',
    function ($scope, $state, $stateParams, PlaylistFactory) {

      var playlistDefaults = {
        title       : '',
        description : '',
        isPublic    : false
      };

      $scope.submittingData = false;

      $scope.playlist = _.clone(playlistDefaults);

      $scope.save = function (formController) {

        $scope.submittingData = true;

        var playlistClone = _.clone($scope.playlist);

        PlaylistFactory.save({}, playlistClone, function (palylistInstance) {
          $scope.playlist = _.clone(playlistDefaults);
          $scope.playlistform.$setPristine();
          $scope.submittingData = false;

          $state.go('^.show', {id : palylistInstance._id});

        }, function () {
          $scope.submittingData = false;
          console.error('Error occured');
        });

      };

      $scope.$on('$destroy', function () {
      });

    }]);
