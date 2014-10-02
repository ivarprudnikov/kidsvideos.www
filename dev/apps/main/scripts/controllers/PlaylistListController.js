'use strict';

/* jshint eqeqeq:false,eqnull:true */

angular.module('io.kidsvideos.admin.main')
  .controller('PlaylistListController', ['$scope', '$state', '$stateParams', '$interval', 'PlaylistFactory', 'Loader',
    function ($scope, $state, $stateParams, $interval, PlaylistFactory, Loader) {

      var loader = new Loader($scope, 'loadingMessage');

      $scope.availableSorts = [
        { name : 'Date created', value : 'dateCreated' },
        { name : 'Last updated', value : 'lastUpdated' },
        { name : 'Title', value : 'title' },
        { name : 'Is public', value : 'isPublic' }
      ];

      $scope.availableOrders = [
        { name : 'Ascending', value : 'asc' },
        { name : 'Descending', value : 'desc' }
      ];

      $scope.availablePublicStates = [
        { name : 'Is public', value : true },
        { name : 'Not public', value : false }
      ];

      $scope.availableApprovedStates = [
        { name : 'Is approved', value : true },
        { name : 'Not approved', value : false }
      ];

      $scope.availableSkippedStates = [
        { name : 'Is skipped', value : true },
        { name : 'Not skipped', value : false }
      ];

      $scope.availablePendingStates = [
        { name : 'Is pending', value : true },
        { name : 'Not pending', value : false }
      ];

      $scope.searchOptions = {
        query      : $stateParams.query || '',
        max        : Math.min((parseInt($stateParams.max) || 10), 100),
        offset     : parseInt($stateParams.offset) || 0,
        sort       : $stateParams.sort || 'dateCreated',
        order      : $stateParams.order === 'asc' ? 'asc' : 'desc',
        isPublic   : ($stateParams.isPublic != null ? $stateParams.isPublic === 'true' : null),
        isApproved : ($stateParams.isApproved != null ? $stateParams.isApproved === 'true' : null),
        isSkipped  : ($stateParams.isSkipped != null ? $stateParams.isSkipped === 'true' : null),
        isPending  : ($stateParams.isPending != null ? $stateParams.isPending === 'true' : null),
        user       : $stateParams.user === 'true'
      };

      $scope.results = null;

      $scope.$watch($stateParams, function () {
        searchForResults();
      });

      function errorHandler(httpResponse) {
        loader.error(httpResponse);
      }

      // select fields that are not null/undefined only
      function selectedSearchOptions() {
        return _.reduce($scope.searchOptions, function (memo, v, k) {
          if (v != null) {
            memo[k] = v;
          }
          return memo;
        }, {});
      }

      function searchForResults() {
        loader.start();
        $scope.results = PlaylistFactory.list(selectedSearchOptions(), null, function (responseData, responseHeaders) {
          loader.stop();
        }, errorHandler);
      }

      $scope.search = function () {
        $state.go($state.$current.name, selectedSearchOptions(), {inherit : false});
      };

      $scope.$on('$destroy', function () {
      });

    }]);
