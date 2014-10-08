'use strict';

(function (undefined, angular) {

  angular.module('com.ivarprudnikov.ng.search', []);

  /**
   * <result-small actions="{'Link name':'scopeFn()'}"></result-small>
   */
  angular.module('com.ivarprudnikov.ng.search')

  .directive(
  'resultImagePreloader',
  function () {
    return {
      restrict : 'A',
      require  : '^resultSmall',
      scope    : {
        ngSrc : '@'
      },
      link     : function (scope, element, attrs, parentCtrl) {

        parentCtrl.registerImageLoader();

        element.on('load', function () {
          parentCtrl.handleImageLoaded();
        });
        element.on('abort', function () {
          parentCtrl.handleImageAborted();
        });
        element.on('error', function () {
          parentCtrl.handleImageError();
        });
        scope.$watch('ngSrc', function () {
          parentCtrl.handleImageLoading();
        });
      }
    };
  })

  .directive(
  'resultStatus', function () {
    return {
      restrict : 'EA',
      require  : '^resultSmall',
      replace  : true,
      scope    : {
        status : '='
      },
      link     : function (scope, element, attrs, parentCtrl) {

        var Status = scope.Status = {
          PENDING  : 'pending',
          APPROVED : 'approved',
          SKIPPED  : 'skipped'
        };

        scope.$watch('status', function () {
          var _status = scope.status + '';
          scope.activeStatus = Status[_status.toUpperCase()] || null;
          scope.isPending = scope.activeStatus === Status.PENDING;
          scope.isApproved = scope.activeStatus === Status.APPROVED;
          scope.isSkipped = scope.activeStatus === Status.SKIPPED;
        });

      },
      template : '' +
      '<div class="sr-item-sm-status" ng-if="activeStatus" ng-class="activeStatus">' +
      '<span class="icon" ng-class="{\'icon-help\':isPending, \'icon-ok\':isApproved, \'icon-attention\':isSkipped}"></span>' +
      '</div>'
    };
  })

  .directive(
  'resultSmall', [
    '$window', '$interval', '$timeout', '$rootScope', '$parse',
    function ($window, $interval, $timeout, $rootScope, $parse) {

      return {

        restrict   : 'EA',
        replace    : true,
        transclude : false,
        scope      : {
          isGridItem   : '=?',
          isActive     : '=?',
          imageUrl     : '=',
          title        : '=',
          status       : '=',
          onImageClick : '&',
          onTitleClick : '&',
          actions      : '@'
        },
        controller : [
          '$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            // IMAGE LOAD API
            /////////////////////////////////

            this.registerImageLoader = function () {
              $timeout(function () {
                $scope.imageIsLoading = true;
              });
            };

            this.handleImageLoaded = function () {
              $timeout(function () {
                $scope.imageIsLoading = false;
              });
            };
            this.handleImageLoading = function () {
              $timeout(function () {
                $scope.imageIsLoading = true;
              });
            };
            this.handleImageAborted = function () {
              $timeout(function () {
                $scope.imageIsLoading = false;
                $scope.imageError = true;
              });
            };
            this.handleImageError = function () {
              $timeout(function () {
                $scope.imageIsLoading = false;
                $scope.imageError = true;
              });
            };

            // DEFAULTS
            /////////////////////////////////

            $scope.dropdownActive = false;
            $scope.imageError = false;

            if ($scope.isGridItem !== false) {
              $scope.isGridItem = true;
            }
            $scope.$watch('isGridItem', function () {
              if ($scope.isGridItem !== false) {
                $scope.isGridItem = true;
              }
            });

            if ($scope.isActive !== true) {
              $scope.isActive = false;
            }
            $scope.$watch('isActive', function () {
              if ($scope.isActive !== true) {
                $scope.isActive = false;
              }
            });

            // PARSE ATTR ACTIONS
            ///////////////////////////

            // eval json obj
            var actionsObject = $scope.$eval($attrs.actions);
            $scope.actionNamesParsed = [];

            // parse each json entry
            // while expecting that each key will be link text
            // and value will be string of function invocation
            // function strings will be parsed and attached
            // to current $scope to be accessed in "ng-click" in template
            angular.forEach(actionsObject, function (actionString, actionName) {
              var fn = $parse(actionString);
              var name = '___' + actionName;
              $scope.actionNamesParsed.push(actionName);
              $scope[name] = function () {
                $timeout(function () {
                  $scope.dropdownActive = false;
                  if (fn) {
                    fn($scope.$parent, {});
                  }
                });
              };
            });

            // CONTROLS
            ////////////////////////////

            $scope.clickImage = function () {
              ($scope.onImageClick || angular.noop)();
            };

            $scope.clickTitle = function () {
              ($scope.onTitleClick || angular.noop)();
            };

            $scope.toggleDropdown = function () {
              $scope.dropdownActive = !$scope.dropdownActive;
            };

          }
        ],

        template : '' +
        '<div class="sr-item-sm" ng-class="{\'sr-item-grid\':isGridItem,\'sr-item-list\':!isGridItem,active:isActive}">' +
        '<div class="sr-item-sm-image-wrapper">' +
        '<div class="sr-item-sm-image-loader" ng-if="imageIsLoading">Loading ...</div>' +
        '<img ng-src="{{imageUrl}}" ng-attr-alt="title" result-image-preloader ng-class="{clickable:onImageClick}" ng-click="clickImage()"/>' +
        '<div class="sr-item-sm-image" ng-class="{clickable:onImageClick}" ng-click="clickImage()" ng-style="{\'background-image\': \'url(\' + imageUrl + \')\'}"></div>' +
        '<div class="sr-item-sm-image-error icon-cancel" ng-if="imageError"></div>' +
        '<result-status status="status"></result-status>' +
        '</div>' +
        '<div class="sr-item-sm-caption-wrapper" >' +
        '<div class="sr-item-sm-caption" ng-click="clickTitle()" ng-class="{clickable:onTitleClick}">{{title}}</div>' +
        '<div class="sr-item-sm-actions" ng-if="actionNamesParsed && actionNamesParsed.length">' +
        '<a class="sr-item-sm-actions-dropdown-trigger" ng-class="{active:dropdownActive}" ng-click="toggleDropdown()">' +
        '<span class="sr-item-sm-actions-icon" ng-class="dropdownActive ? \'icon-cancel-circled\' : \'icon-ellipsis-vert\'"></span>' +
        '</a>' +
        '<div class="sr-item-sm-dropdown" ng-show="dropdownActive">' +
        '<a ng-repeat="name in actionNamesParsed" ng-click="this[\'___\' + name]()">{{name}}</a>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>'

      };
    }
  ]);

})(undefined, angular);