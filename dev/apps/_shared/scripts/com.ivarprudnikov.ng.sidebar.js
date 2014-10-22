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

            $($element).css({display:'block'});

            $scope.isOpen = false;
            syncBodyClass();

            $scope.toggle = function(){
              $scope.isOpen = !$scope.isOpen;
              syncBodyClass();
            };

            $scope.close = function(){
              $scope.isOpen = false;
              syncBodyClass();
            };

            function syncBodyClass(){
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
        '<div class="sidebar-wrapper {{position}}" ng-class="{open:isOpen}" >' +
        '  <div class="sidebar-close-trigger" ng-click="close()"></div>' +
        '  <div class="sidebar {{position}}" ng-class="{open:isOpen}">' +
        '    <div class="sidebar-toggle" tabindex="-1" ng-click="toggle()">' +
        '      <span class="bar bar-01"></span><span class="bar bar-02"></span><span class="bar bar-03"></span>' +
        '    </div>' +
        '    <div class="sidebar-content" ng-transclude>' +
        '    </div>' +
        '  </div>' +
        '</div>'
      }

    }
  ]);

})
(angular);