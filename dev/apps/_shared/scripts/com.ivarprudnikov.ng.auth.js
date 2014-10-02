'use strict';

/* globals angular,easyXDM */

(function (angular, easyXDM) {

  var mod = angular.module(
  'com.ivarprudnikov.ng.auth', [
    'com.ivarprudnikov.ng.config', 'ui.bootstrap'
  ]
  );

  mod.factory(
  'authService',
  [
    '$window',
    '$timeout',
    '$q',
    '$modal',
    'httpBuffer',
    'configuration',
    '$http',
    function ($window, $timeout, $q, $modal, httpBuffer, configuration, $http) {

      function storeToken(token) {
        $window.sessionStorage.token = token;
      }

      function tokenExists() {
        return !!$window.sessionStorage.token;
      }

      function deleteToken() {
        delete $window.sessionStorage.token;
      }

      function preparePromise(promise) {
        promise.success = function (fn) {
          promise.then(fn);
          return promise;
        };
        promise.error = function (fn) {
          promise.then(null, fn);
          return promise;
        };
      }

      var promise = null;

      return {

        hasToken : function () {
          return tokenExists();
        },

        noConnection : function () {
          deleteToken();
          if (promise) {
            promise.reject();
            promise = null;
          }
          $window.alert('Connection error');
        },

        login : function (options) {

          if (promise) {
            return promise;
          }

          var defaults = {
            form   : configuration.auth.formEnabled,
            social : configuration.auth.socialEnabled
          };
          angular.extend(defaults, options);

          var deferred = $q.defer();
          promise = deferred.promise;

          preparePromise(promise);

          // as operation might have been triggered by invalid token
          deleteToken();

          $modal.open(
          {
            templateUrl : 'views/login.html',
            backdrop    : 'static',
            size        : 'sm',
            keyboard    : false,
            controller  : 'LoginModalController',
            resolve     : {
              data : function () {
                return defaults;
              }
            }
          }
          ).result.then(
          function (token) {
            storeToken(token);
            httpBuffer.retryAll(
            function (config) {
              return config;
            }
            );
            deferred.resolve();
          }, function (error) {
            deleteToken();
            deferred.reject();
          }
          ).catch(
          function (error) {
            deleteToken();
            deferred.reject();
          }
          ).finally(
          function () {
            promise = null;
          }
          );

          return promise;
        },

        logout : function () {

          var deferred = $q.defer();
          var promise = deferred.promise;
          preparePromise(promise);

          $timeout(
          function () {
            deleteToken();
            deferred.resolve();
          }
          );

          return promise;
        }
      };

    }
  ]
  );

  /**
   * View for the login modal
   */
  mod.run(
  [
    '$templateCache',
    function ($templateCache) {
      $templateCache.put(
      'views/login.html',
      '<div class="modal-header">\n' +
      ' <button type="button" class="close" ng-click="cancelModal()">&times;</button>' +
      ' <h4 class="modal-title">Sign in</h4>\n' +
      '</div>\n' +
      '<div class="modal-body">\n' +
      ' <p ng-if="loadingMessage" class="text-warning">{{loadingMessage}}</p>' +
      ' <form ng-if="formLoginPath" role="form" ng-submit="login()">\n' +
      '   <div class="form-group">\n' +
      '     <label for="username" class="sr-only">Username</label>\n' +
      '     <input ng-disabled="inProgress" type="text" class="form-control" id="username" placeholder="Username" ng-model="user.username">\n' +
      '   </div>\n' +
      '   <div class="form-group">\n' +
      '     <label for="password" class="sr-only">Password</label>\n' +
      '     <input ng-disabled="inProgress" type="password" class="form-control" id="password" placeholder="Password" ng-model="user.password">\n' +
      '   </div>\n' +
      '   <button ng-disabled="inProgress" type="submit" class="btn btn-primary btn-block">Login</button>\n' +
      ' </form>\n' +
      ' <p ng-if="providers && providers.length">Please sign in using one of the available providers</p>' +
      ' <button ng-repeat="p in providers" type="button" class="btn btn-block btn-default" ng-click="open(p.name)">{{p.name}}</button>\n' +
      '</div>'
      );
    }
  ]
  );

  mod.controller(
  'LoginModalController', [
    '$window', '$timeout', '$interval', '$scope', '$modalInstance', 'configuration', '$http', 'data',
    function ($window, $timeout, $interval, $scope, $modalInstance, configuration, $http, DATA) {

      var
      messageInterval = null,
      msg0 = 'Loading ...',
      msg1 = 'Still loading ...',
      msg2 = 'Takes longer than usual ...',
      msg3 = 'No connection'
      ;
      $scope.loadingMessage = '';

      $scope.providers = [];
      $scope.formLoginEnabled = false;
      $scope.formLoginPath = '';
      $scope.user = {
        username : '',
        password : ''
      };
      $scope.inProgress = false;

      function startLoadingMessage() {
        $scope.loadingMessage = msg0;
        messageInterval = $interval(
        function () {
          if ($scope.loadingMessage === msg0) {
            $scope.loadingMessage = msg1;
          } else if ($scope.loadingMessage === msg1) {
            $scope.loadingMessage = msg2;
          } else if ($scope.loadingMessage.length === (msg2.length + 2)) {
            stopMessageInterval();
            $scope.loadingMessage = msg3;
          } else {
            $scope.loadingMessage += '.';
          }
        }, 7000
        );
      }

      startLoadingMessage();

      function stopMessageInterval() {
        if (angular.isDefined(messageInterval)) {
          $scope.loadingMessage = '';
          $interval.cancel(messageInterval);
        }
      }

      function errorHandler(msg) {
        stopMessageInterval();
        $scope.loadingMessage = msg;
      }

      function onAuthSuccess(token) {
        $timeout(
        function () {
          $modalInstance.close(token);
        }
        );
      }

      var auth = {
        proxy          : null,
        win            : null,
        winName        : 'authentication',
        windowFeatures : 'width=400, height=400, menubar=no, location=no, resizable=no, scrollbars=no, status=no"',
        needsAfter     : false,
        remote         : '',
        timeout        : null
      };

      auth.proxy = new easyXDM.Rpc(
      {
        remote  : configuration.auth.login, // the path to the page sending provider list
        onReady : function () {

          if (DATA.social) {
            auth.proxy.getAvailableProviders(
            function (providerList) {
              $timeout(
              function () {
                stopMessageInterval();
                $scope.providers = providerList;
              }
              );
            }, function (errorObj) {
              console.log('getAvailableProviders errorObj', errorObj);
              errorHandler('Could not load authentication providers.');
            }
            );
          }

          if (DATA.form) {
            auth.proxy.formLoginPath(
            function (formLoginPath) {
              $timeout(
              function () {
                stopMessageInterval();
                $scope.formLoginPath = formLoginPath;
              }
              );
            }, function (errorObj) {
              console.log('formLoginPath errorObj', errorObj);
              errorHandler('Could not load authentication form.');
            }
            );
          }

        },
        message : function (msg, origin) {
          console.log('msg', msg);
          console.log('origin', origin);
          errorHandler('Could not connect to authentication server');
        }
      }, {
        local  : {
          postMessage : function (token) {
            $timeout(
            function () {
              onAuthSuccess(token);
            }
            );
          }
        },
        remote : {
          getAvailableProviders : {},
          formLoginPath         : {},
          open                  : {}
        }
      }
      );

      $scope.open = function (providerName) {
        if (auth.win) {
          auth.win.close();
        }
        auth.win = $window.open(configuration.auth.blank, auth.winName, auth.windowFeatures);
        if (auth.win) {
          auth.timeout = setTimeout(
          function () {
            auth.proxy.open(providerName, auth.winName);
          }, 300
          );
        } else {
          errorHandler('Could not open authentication popup.');
        }
      };

      $scope.login = function () {
        if ($scope.formLoginPath) {

          startLoadingMessage();
          $scope.inProgress = true;

          $http.post(
          $scope.formLoginPath, $scope.user, {
            headers          : {
              'X-Requested-With' : 'kidsvideos'
            },
            ignoreAuthModule : true
          }
          ).success(
          function (data, status, headers, config) {
            $scope.username = '';
            $scope.password = '';
            $scope.inProgress = false;
            onAuthSuccess(data.token);
          }
          ).error(
          function (data, status, headers, config) {
            $scope.inProgress = false;
            errorHandler('Authentication failed.');
          }
          );
        }
      };

      $scope.cancelModal = function () {
        $modalInstance.dismiss();
      };

    }
  ]
  );

  mod.config(
  [
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push(
      [
        '$rootScope',
        '$q',
        '$window',
        'httpBuffer',
        'configuration',
        function ($rootScope, $q, $window, httpBuffer, configuration) {
          return {
            request       : function (config) {
              config.headers = config.headers || {};
              if ($window.sessionStorage.token) {
                config.headers[configuration.auth.tokenHeaderName] = 'Bearer ' + $window.sessionStorage.token;
              }
              return config;
            },
            responseError : function (rejection) {
              if (rejection.status === 401 && !rejection.config.ignoreAuthModule) {
                var deferred = $q.defer();
                httpBuffer.append(rejection.config, deferred);
                $rootScope.$broadcast('event:auth-loginRequired', rejection);
                return deferred.promise;
              }
              if (rejection.status === 0) {
                $rootScope.$broadcast('event:auth-error', rejection);
                return;
              }
              // otherwise, default behaviour
              return $q.reject(rejection);
            }
          };
        }
      ]
      );
    }
  ]
  );

  mod.run(
  [
    '$rootScope', 'authService',
    function ($rootScope, authService) {
      $rootScope.$on(
      'event:auth-loginRequired', function () {
        authService.login();
      }
      );
      $rootScope.$on(
      'event:auth-error', function () {
        authService.noConnection();
      }
      );
    }
  ]
  );

  mod.factory(
  'httpBuffer', [
    '$injector', function ($injector) {

      /** Holds all the requests, so they can be re-requested in future. */
      var buffer = [];

      /** Service initialized later because of circular dependency problem. */
      var $http;

      function retryHttpRequest(config, deferred) {
        function successCallback(response) {
          deferred.resolve(response);
        }

        function errorCallback(response) {
          deferred.reject(response);
        }

        $http = $http || $injector.get('$http');
        $http(config).then(successCallback, errorCallback);
      }

      return {
        append    : function (config, deferred) {
          buffer.push(
          {
            config   : config,
            deferred : deferred
          }
          );
        },
        rejectAll : function (reason) {
          if (reason) {
            for (var i = 0; i < buffer.length; ++i) {
              buffer[i].deferred.reject(reason);
            }
          }
          buffer = [];
        },
        retryAll  : function (updater) {
          for (var i = 0; i < buffer.length; ++i) {
            retryHttpRequest(updater(buffer[i].config), buffer[i].deferred);
          }
          buffer = [];
        }
      };
    }
  ]
  );

})(angular, easyXDM);

