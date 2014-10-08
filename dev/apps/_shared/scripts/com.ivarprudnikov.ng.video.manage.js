'use strict';

/* globals angular */

(function (angular) {

  var mod = angular.module(
  'com.ivarprudnikov.ng.video.manage', [
    'com.ivarprudnikov.ng.util', 'com.ivarprudnikov.ng.config', 'com.ivarprudnikov.ng.data', 'ui.bootstrap'
  ]
  );

  mod.factory(
  'ManageVideoService', [
    '$window', '$timeout', '$q', '$modal',
    function ($window, $timeout, $q, $modal) {

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

        addVideo : function (videoActivity) {

          if (promise) {
            return promise;
          }

          var deferred = $q.defer();
          promise = deferred.promise;

          preparePromise(promise);

          $modal.open(
          {
            templateUrl : 'views/addVideoToPlaylist.html',
            backdrop    : 'static',
            size        : 'md',
            keyboard    : true,
            controller  : 'AddVideoModalController',
            resolve     : {
              videoActivity : function () {
                return videoActivity;
              }
            }
          }
          ).result.then(
          function (videoAdded) {
            deferred.resolve(videoAdded);
          }, function (error) {
            deferred.reject(error);
          }
          ).catch(
          function (error) {
            deferred.reject(error);
          }
          ).finally(
          function () {
            promise = null;
          }
          );

          return promise;
        }

      };

    }
  ]
  );

  mod.run(
  [
    '$templateCache',
    function ($templateCache) {
      $templateCache.put(
      'views/addVideoToPlaylist.html',
      '<div class="modal-header">\n' +
      ' <h3 class="modal-title">Add video ' +
      ' <span ng-if="creatingPlaylist"><span class="glyphicon glyphicon-chevron-right"></span> create playlist</span>' +
      '</h3>\n' +
      '</div>\n' +

      '<form ng-if="!creatingPlaylist" name="forms.video" novalidate rc-submit="addVideo()">' +
      '<div class="modal-body">\n' +
      '  <p ng-if="loadingMessage" class="text-warning">{{loadingMessage}}</p>' +
      '  <div ng-if="!loadingMessage" class="form-group">' +
      '    <label>Video</label>' +
      '    <p class="form-control">{{video.displayName}}</p>' +
      '  </div>' +
      '  <div class="form-group" ng-class="{\'has-error\': rc[\'forms.video\'].needsAttention(forms.video.playlist) && rc[\'forms.video\'].attempted, \'has-warning\':!loadingMessage && !playlists.length }">' +
      '    <label for="playlist">Playlist</label>' +
      '    <select ng-if="playlists.length" required id="playlist" class="form-control" name="playlist" ng-model="forms.video.playlist" ng-options="p.title for p in playlists track by p._id">' +
      '      <option value="">-- pick playlist --</option>' +
      '    </select>' +
      '    <p ng-if="!loadingMessage && !playlists.length" class="form-control">You have no playlists</p>' +
      '    <span class="help-block" ng-show="!loadingMessage && !playlists.length">Please create playlist</span>' +
      '    <span class="help-block"><button type="button" class="btn btn-link pull-right" ng-click="createPlaylist()">Create new playlist</button></span>' +
      '    <span class="help-block" ng-show="rc[\'forms.video\'].needsAttention(forms.video.playlist) && rc[\'forms.video\'].attempted">Please select playlist</span>' +
      '  </div>' +
      '</div>\n' +
      '<div class="modal-footer">\n' +
      '  <button type="button" class="btn btn-danger" ng-click="cancelModal()">Cancel</button>' +
      '  <button ng-if="forms.video.playlist._id" type="submit" class="btn btn-primary" ng-disabled="submittingVideoData" >' +
      '    <span>Add video</span>' +
      '  </button>' +
      '</div>' +
      '</form>' +

      '<form ng-if="creatingPlaylist" name="forms.playlist" novalidate rc-submit="savePlaylist()">' +
      '<div class="modal-body" ng-hide="submittingPlaylistData">\n' +
      '  <div class="form-group" ng-class="{\'has-error\': rc[\'forms.playlist\'].needsAttention(forms.playlist.title) && rc[\'forms.playlist\'].attempted, \'has-warning\':rc[\'forms.playlist\'].needsAttention(forms.playlist.title) && !rc[\'forms.playlist\'].attempted }">' +
      '    <label for="title">Title</label>' +
      '    <input type="text" required ng-model="playlist.title" class="form-control" id="title" name="title" placeholder="eg: Dora explorer colection" >' +
      '    <span class="help-block" ng-show="rc[\'forms.playlist\'].needsAttention(forms.playlist.title) && rc[\'forms.playlist\'].attempted">Please provide valid title</span>' +
      '  </div>' +
      '  <div class="form-group">' +
      '    <label for="description">Description</label>' +
      '    <textarea rows="5" ng-model="playlist.description" class="form-control" id="description" name="description" placeholder="Optional description"></textarea>' +
      '  </div>' +
      '  <div class="checkbox">' +
      '    <label><input type="checkbox" ng-model="playlist.isPublic"> Will it be available publicly</label>' +
      '  </div>' +
      '</div>\n' +
      '<div class="modal-footer" ng-hide="submittingPlaylistData">\n' +
      '  <button type="button" class="btn btn-link pull-left" ng-click="cancelCreatePlaylist()">Back</button>' +
      '  <button type="submit" class="btn btn-primary" value="Send" title="Send" ng-disabled="submittingPlaylistData" >' +
      '    <span>Save</span>' +
      '  </button>' +
      '</div>' +
      '<div class="modal-body" ng-show="submittingPlaylistData">\n' +
      '  <p class="alert alert-warning">Submitting ...</p>' +
      '</div>\n' +
      '</form>'
      );
    }
  ]
  );

  mod.controller(
  'AddVideoModalController', [
    '$window', '$timeout', '$interval', '$scope', '$modalInstance', 'configuration', 'videoActivity',
    'YoutubeVideoActivityFactory', 'PlaylistFactory', 'Loader', '$q',
    function ($window, $timeout, $interval, $scope, $modalInstance, configuration, videoActivity,
    YoutubeVideoActivityFactory, PlaylistFactory, Loader, $q) {

      var loader = new Loader($scope, 'loadingMessage').start();
      var playlistDefaults = {
        title       : '',
        description : '',
        isPublic    : false
      };

      $scope.forms = {
        video    : {},
        playlist : {}
      };

      $scope.creatingPlaylist = false;

      // cancel/close modal
      $scope.cancelModal = function () {
        loader.stop();
        $modalInstance.dismiss();
      };

      function loadVideo() {
        var deferred = $q.defer();

        YoutubeVideoActivityFactory.checkVideo( videoActivity, function (err, existingOrNew) {
          if (err) {
            deferred.reject(err);
          } else {
            deferred.resolve(existingOrNew);
          }
        });

        return deferred.promise;
      }

      function loadPlaylists() {
        var deferred = $q.defer();
        PlaylistFactory.list(
        {user : true}, null, function (responseData, responseHeaders) {
          deferred.resolve(responseData.items);
        }, function (err) {
          deferred.reject(err);
        }
        );
        return deferred.promise;
      }

      $q.all({ video : loadVideo(), playlists : loadPlaylists() }).then(
      function (results) {
        $timeout(
        function () {
          $scope.video = results.video;
          $scope.playlists = results.playlists;
          loader.stop();
        }
        );
      }
      );

      $scope.createPlaylist = function () {
        $scope.creatingPlaylist = true;
        $scope.submittingPlaylistData = false;
        $scope.playlist = angular.copy(playlistDefaults);
      };

      $scope.cancelCreatePlaylist = function () {
        $scope.creatingPlaylist = false;
      };

      $scope.savePlaylist = function (formController) {
        $scope.submittingPlaylistData = true;
        var playlistClone = angular.copy($scope.playlist);
        PlaylistFactory.save(
        {}, playlistClone, function (palylistInstance) {
          $scope.playlist = angular.copy(playlistDefaults);
          $scope.forms.playlist.$setPristine();

          loadPlaylists().then(
          function (playlists) {
            $scope.playlists = playlists;
            angular.forEach(
            $scope.playlists, function (value, key) {
              if (value && value._id === palylistInstance._id) {
                $timeout(
                function () {
                  $scope.forms.video.playlist = value;
                }
                );
              }
            }
            );
            $scope.cancelCreatePlaylist();
            $scope.submittingPlaylistData = false;

          }
          );

        }, function () {
          $scope.submittingPlaylistData = false;
        }
        );
      };

      $scope.addVideo = function () {
        var queryParams = {id : $scope.forms.video.playlist._id};
        var postData = {videoId : $scope.video._id};
        PlaylistFactory.addVideo(
        queryParams, postData, function (responseData, responseHeaders) {
          $modalInstance.close(responseData);
        }, function (err) {
          $modalInstance.dismiss(err);
        }
        );

      };

    }
  ]
  );

}(angular));

