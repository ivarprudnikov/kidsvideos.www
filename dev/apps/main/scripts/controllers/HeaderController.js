'use strict';

angular.module('io.kidsvideos.admin.main').controller('HeaderController', ['$scope', '$window', 'authService', 'configuration', function ($scope, $window, authService, configuration) {

  $scope.hasToken = function () {
    return authService.hasToken();
  };

  $scope.signIn = function () {
    authService.login().success(function () {
      $window.location.reload();
    });
  };

  $scope.signOut = function () {
    authService.logout().success(function () {
      $window.location.replace(configuration.app.baseUrl);
    }).error(function () {
      $window.location.replace(configuration.app.baseUrl);
    });
  };

}]);
