'use strict';

(function (angular) {

  var MODULE = angular.module('com.ivarprudnikov.ng.sidebar', []);

  MODULE.directive('sidebar', [
    '$rootScope',
    '$window',
    '$timeout',
    '$state',
    function ($rootScope, $window, $timeout, $state) {

      return {
        restrict   : 'EA',
        replace    : true,
        transclude : true,
        scope      : {
          position   : '='
        },
        controller : [
          '$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            $scope.isOpen = false;
            $scope.toggle = function(){
              $scope.isOpen = !$scope.isOpen;
              var bodyClass = 'sidebar-' + $scope.position + '-open';
              if($scope.isOpen){
                $('body').addClass(bodyClass);
              } else {
                $('body').removeClass(bodyClass);
              }
            }
          }
        ],

        template : '' +
        '<div class="sidebar {{position}}" ng-class="{open:isOpen}">' +
        '<div class="sidebar-toggle" ng-click="toggle()"></div>' +
        '<div class="sidebar-content" ng-transclude>' +
        '</div>' +
        '</div>'
      }

    }
  ]);

})
(angular);