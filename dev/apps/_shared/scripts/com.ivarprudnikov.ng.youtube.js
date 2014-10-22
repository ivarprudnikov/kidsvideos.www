(function (undefined, angular, Hammer, $) {

  'use strict';

  angular.module('com.ivarprudnikov.ng.youtube', ['LocalStorageModule'])
    .config(['localStorageServiceProvider', function (localStorageServiceProvider) {
      localStorageServiceProvider.setPrefix('yt_prefs');
    }]);

  angular.module('com.ivarprudnikov.ng.youtube')
    .service('YoutubePlayerStartupService', ['$window', function ($window) {

      var self = this;

      // API initialization
      //////////////////////////

      this.apiLoading = false;
      this.apiLoaded = false;

      this.initApi = function () {
        if ('object' === typeof YT) {
          self.onYouTubeIframeAPIReady();
        }
        if (this.apiLoading || this.apiLoaded) {
          return;
        }
        this.apiLoading = true;
        var tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = 'async';
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      };

      this.isYoutubeIframeApiLoaded = function () {
        return this.apiLoaded === true;
      };

      this.onYouTubeIframeAPIReady = function () {
        this.apiLoading = false;
        this.apiLoaded = true;
      };

      // Youtube api initialization
      $window.onYouTubeIframeAPIReady = function () {
        self.onYouTubeIframeAPIReady.apply(self, []);
      };
      this.initApi();

    }]);

  angular.module('com.ivarprudnikov.ng.youtube')
    .factory('PlayerDataFactory', ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {

      var defaults = {};
      defaults.volume = 100;
      defaults.qualitiesMap = {
        default : 'Default',
        highres : 'Highres',
        hd1080  : 'HD 1080',
        hd720   : 'HD 720',
        large   : 'Large',
        medium  : 'Medium',
        small   : 'Small'
      };
      defaults.qualities = Object.keys(defaults.qualitiesMap);
      defaults.quality = defaults.qualities[0];
      defaults.videoControlsReady = false;

      var PlayerData = function () {
      };

      PlayerData.prototype = {

        getVolume : function () {
          var vol = parseInt(localStorageService.get('volume'));
          if (isNaN(vol)) {
            return this.setVolume(defaults.volume);
          }
          return vol;
        },

        setVolume : function (volume) {
          localStorageService.set('volume', volume);
          return this.getVolume();
        },

        getQualities : function () {
          return defaults.qualitiesMap;
        },

        getQuality : function () {
          var q = localStorageService.get('quality');
          if (defaults.qualities.indexOf(q) === -1) {
            return this.setQuality(defaults.quality);
          }
          return q;
        },

        getQualityName : function (name) {
          if (defaults.qualitiesMap.indexOf(name) === -1) {
            throw new Error('Quality name %s is unrecognized among %s', name, defaults.qualities);
          }
          return defaults.qualitiesMap[name];
        },

        setQuality : function (quality) {
          localStorageService.set('quality', quality);
          return this.getQuality();
        },

        getVideoControlsReady : function () {

          /* jshint eqeqeq:false,eqnull:true */

          var ready = localStorageService.get('videoControlsReady');
          if (ready == null) {
            return this.setVideoControlsReady(defaults.videoControlsReady);
          }
          return ready === 'true';
        },

        setVideoControlsReady : function (videoControlsReady) {
          localStorageService.set('videoControlsReady', videoControlsReady);
          return this.getVideoControlsReady();
        }
      };

      return new PlayerData();

    }]);

  angular.module('com.ivarprudnikov.ng.youtube')
    .directive('youtubePlayer', ['YoutubePlayerStartupService', 'PlayerDataFactory', '$window', '$interval', '$timeout', '$rootScope',
      function (YoutubePlayerStartupService, PlayerDataFactory, $window, $interval, $timeout, $rootScope) {

        return {
          restrict   : 'EA',
          replace    : true,
          transclude : true,
          scope      : {
            videoid               : '=',
            minheight             : '=',
            playerorigin          : '=',
            onNextLoadVideoId     : '&',
            onPreviousLoadVideoId : '&'
          },
          controller : ['$scope', '$element', function ($scope, $element) {

            var resizeListenerEl,
              volumeKnobEl, timeKnobEl, timerIsDragged, volumeDragger, timerDragger,
              timeContainer, volumeContainer
              ;

            // DEFAULTS
            /////////////////////////////////

            $scope.videoIsLoading = false;
            $scope.videoError = false;
            $scope.bufferPercent = 0;
            $scope.progressPercent = 0;
            $scope.progressPrettyTime = '0:00';
            $scope.volumePercent = PlayerDataFactory.getVolume.call(PlayerDataFactory);
            $scope.playerState = -1; // -1 (unstarted); 0 (ended); 1 (playing); 2 (paused); 3 (buffering); 5 (video cued)
            $scope.playbackQualityChosen = PlayerDataFactory.getQuality.call(PlayerDataFactory);
            $scope.playbackQualities = PlayerDataFactory.getQualities.call(PlayerDataFactory);

            $scope.playbackQualityActive = null;
            $scope.playbackQualitiesAvailable = null;

            $scope.timeElapsed = '0:00';
            $scope.timeRemaining = '0:00';
            $scope.timeTotal = '0:00';
            $scope.wrapperStyles = {
              'min-height' : $scope.minheight || '150px'
            };

            // PLAYER BUILDER
            /////////////////////////////////

            function buildPlayer() {

              $scope.videoIsLoading = true;

              var iframeEl = $element[0].getElementsByClassName('video-view-iframe')[0];
              if (!iframeEl) {
                throw new Error('iframeEl is not found, probably template is broken');
              }

              if (!YoutubePlayerStartupService.isYoutubeIframeApiLoaded()) {
                $timeout(function () {
                  buildPlayer();
                }, 1000);
                return;
              }

              if (!$scope.player) {
                $scope.player = new $window.YT.Player(iframeEl, {
                  height  : $element[0].offsetHeight,
                  width   : $element[0].offsetWidth,
                  videoId : $scope.videoid,
                  events  : {
                    onReady                 : onPlayerReady,
                    onStateChange           : onPlayerStateChanged,
                    onPlaybackQualityChange : onPlayerPlaybackQualityChanged,
                    onPlaybackRateChange    : onPlayerPlaybackRateChanged,
                    onError                 : onPlayerError
                  },

                  /* jshint camelcase:false */

                  playerVars : {
                    enablejsapi    : 1,
                    controls       : 0,
                    iv_load_policy : 3,
                    modestbranding : 1,
                    origin         : ($scope.playerorigin || 'http://localhost'),
                    rel            : 0,
                    showinfo       : 0
                  }
                });
              } else {
                throw new Error('cannot build yt player as one exists already');
              }
            }

            // PLAYER HANDLERS
            //////////////////////////////

            function onPlayerReady(e) {
              $scope.setDefaultPlayerVolume();
              $scope.syncVideoQuality();
              $scope.timeTotal = secondsToReadableFormat($scope.player.getDuration());
              $scope.videoIsLoading = false;
              $scope.$apply();
            }

            function cancelVideoIntervals() {
              if ($scope.__videoBufferInterval) {
                $interval.cancel($scope.__videoBufferInterval);
              }
              if ($scope.__videoInterval) {
                $interval.cancel($scope.__videoInterval);
              }
            }

            function secondsToReadableFormat(seconds) {
              var input = angular.isNumber(seconds) ? seconds : 0;
              var t = Math.round(input);
              var sec = t % 60;
              var min = ((t - sec) / 60) % 60;
              var h = ((t - sec) - (min * 60)) / 3600;
              var time = (h > 0 ? h + ':' : '') + (min < 10 && h > 0 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
              return time;
            }

            function onPlayerStateChanged(evt) {
              var e = evt || {}, controlsReady,
                total, elapsed;

              $scope.playerState = e.data;
              controlsReady = PlayerDataFactory.getVideoControlsReady.call(PlayerDataFactory);
              if ($scope.player && !controlsReady) {
                PlayerDataFactory.setVideoControlsReady.call(PlayerDataFactory, true);
              }

              total = $scope.player.getDuration();
              $scope.timeTotal = secondsToReadableFormat(total);

              cancelVideoIntervals();
              if ($scope.player) {
                $scope.__videoBufferInterval = $interval(function () {
                  $scope.bufferPercent = $scope.player.getVideoLoadedFraction() * 100;
                }, 200);
              }
              if ($scope.player && $scope.playerState === 1) {
                $scope.__videoInterval = $interval(function () {
                  elapsed = $scope.player.getCurrentTime();
                  $scope.timeElapsed = secondsToReadableFormat(elapsed);
                  $scope.timeRemaining = secondsToReadableFormat(total - elapsed);
                  if(!timerIsDragged){
                    $scope.progressPercent = elapsed / total * 100;
                  }
                }, 200);
              }

              // TODO allow external function to specify what to do on next
              if ($scope.playerState === 0) {
                $scope.playNext();
              }

            }

            function onPlayerPlaybackQualityChanged(e) {
              $scope.syncVideoQuality();
            }

            function onPlayerPlaybackRateChanged(e) {
              console.log('playerPlaybackRateChanged');
            }

            function onPlayerError(e) {
              $timeout(function(){
                $scope.videoError = true;
                $scope.videoIsLoading = false;
                console.error('playerError', e);
              });
            }

            function getElementPercentFromEvent(event, className){
              var rect = $element[0].getElementsByClassName(className)[0].getBoundingClientRect();
              var width = rect.right - rect.left;
              var value = event.center.x - rect.left;
              var percentOutOfBounds = (value / width * 100).toFixed();
              var percent;
              if (percentOutOfBounds > 100) {
                percent = 100;
              } else if (percentOutOfBounds < 0) {
                percent = 0;
              } else {
                percent = percentOutOfBounds;
              }
              return percent;
            }

            // ELEMENT EVENT HANDLERS
            ///////////////////////////

            // VOLUME LISTENER/HANDLER

            /* jshint camelcase:false */

            function dragVolume(event) {

              var percent = getElementPercentFromEvent(event, 'video-audio-container');

              // if it is a dragend then store
              // value in localstorage
              if (event.type === 'panend' || event.type === 'tap') {
                $scope.volumePercent = PlayerDataFactory.setVolume.call(PlayerDataFactory, percent);
              } else {
                $scope.volumePercent = percent;
              }

              // set volume in player
              if ($scope.player) {
                $scope.player.setVolume(percent);
              }

              $scope.$apply();

            }

            volumeKnobEl = $element[0].getElementsByClassName('video-audio-volume-knob')[0];
            volumeDragger = new Hammer(volumeKnobEl);
            volumeDragger.on('pan', dragVolume);

            volumeContainer = $element[0].getElementsByClassName('video-audio-container-touch-area')[0];
            new Hammer(volumeContainer).on('tap', dragVolume);

            // VIDEO TIME LISTENER/HANDLER

            function getVideoSecondsFromPercent(percent){
              if ($scope.player && typeof $scope.player.getDuration === 'function') {
                var totalVideoTimeInSeconds = $scope.player.getDuration();
                return totalVideoTimeInSeconds * percent / 100;
              } else {
                return 0;
              }
            }

            function dragTime(event) {

              timerIsDragged = true;

              var percent = getElementPercentFromEvent(event, 'video-time-container');
              $scope.progressPercent = percent;
              $scope.$apply();

              if (event.type === 'panend' && $scope.player) {
                $scope.player.seekTo(getVideoSecondsFromPercent(percent), true);
              }

              if (event.type === 'panend' || event.type === 'pancancel')
                timerIsDragged = false;
            }

            timeKnobEl = $element[0].getElementsByClassName('video-time-knob')[0];
            timerDragger = new Hammer(timeKnobEl);
            timerDragger.on('pan panend pancancel', dragTime);


            timeContainer = $element[0].getElementsByClassName('video-time-container-touch-area')[0];
            new Hammer(timeContainer).on('tap', function(event){
              var percent = getElementPercentFromEvent(event, 'video-time-container');
              $scope.progressPercent = percent;
              $scope.$apply();
              $scope.player.seekTo(getVideoSecondsFromPercent(percent), true);
            });

            // WATCHERS
            ////////////////////////////

            $scope.$watch('videoid', function (newValue, oldValue) {

              /* jshint eqeqeq:false,eqnull:true */

              if ((!oldValue && newValue) || (newValue != null && newValue === oldValue)) {
                buildPlayer();
              } else if (oldValue != null && newValue != null && newValue !== oldValue) {
                $scope.player.loadVideoById(newValue);
              }
            });

            $scope.$watch('minheight', function (newValue, oldValue) {
              if (newValue) {
                $scope.wrapperStyles['min-height'] = newValue;
              }
            });

            $scope.$watch('progressPercent',function(newValue, oldValue){
              var sec = getVideoSecondsFromPercent(newValue);
              $scope.progressPrettyTime = secondsToReadableFormat(sec);
            });

            // PLAYER SIZING
            ////////////////////////////

            // subscribe to element size changes
            resizeListenerEl = $element[0].getElementsByClassName('video-view-content')[0];
            function onElementResize(e) {
              if ($scope.player) {
                $scope.player.setSize(resizeListenerEl.offsetWidth, resizeListenerEl.offsetHeight);
              }
            }

            $window.addResizeListener(resizeListenerEl, onElementResize);

            // SCOPE DESTROY
            //////////////////////////////

            $scope.$on('destroy', function () {
              $window.removeResizeListener(resizeListenerEl, onElementResize);
            });

            // CONTROLS
            ////////////////////////////

            $scope.play = function () {

              /* jshint eqeqeq:false,eqnull:true */

              if ($scope.player != null && PlayerDataFactory.getVideoControlsReady.call(PlayerDataFactory)) {
                $scope.player.playVideo();
              }
            };

            $scope.pause = function () {

              /* jshint eqeqeq:false,eqnull:true */

              if ($scope.player != null) {
                $scope.player.pauseVideo();
              }
            };

            $scope.togglePlayback = function () {

              /* jshint eqeqeq:false,eqnull:true */

              if ($scope.player != null && PlayerDataFactory.getVideoControlsReady.call(PlayerDataFactory)) {
                var state = $scope.player.getPlayerState();
                if (state === 1) {
                  $scope.pause();
                } else {
                  $scope.play();
                }
              }
            };

            $scope.stop = function () {

              /* jshint eqeqeq:false,eqnull:true */

              cancelVideoIntervals();
              $scope.bufferPercent = 0;
              $scope.progressPercent = 0;
              if ($scope.player != null) {
                $scope.player.stopVideo();
              }
            };

            $scope.setDefaultPlayerVolume = function () {
              if ($scope.player) {
                $scope.player.setVolume(PlayerDataFactory.getVolume.call(PlayerDataFactory));
              }
            };

            $scope.setVideoQuality = function (quality) {

              $scope.playbackQualityChosen = PlayerDataFactory.setQuality.call(PlayerDataFactory, quality);
              if ($scope.player) {
                $scope.player.setPlaybackQuality($scope.playbackQualityChosen);
              }

            };

            $scope.syncVideoQuality = function () {
              $scope.playbackQualityChosen = PlayerDataFactory.getQuality.call(PlayerDataFactory);
              if ($scope.player) {
                $scope.playbackQualityActive = $scope.player.getPlaybackQuality();
                $scope.playbackQualitiesAvailable = $scope.player.getAvailableQualityLevels();
              }
            };

            $scope.playNext = function () {
              $scope.pause();
              var nextId = ($scope.onNextLoadVideoId || angular.noop)({currentId : $scope.videoid});
              if (nextId && $scope.player) {
                $scope.stop();
                $scope.videoid = nextId;
                $scope.player.loadVideoById($scope.videoid);
                $scope.$apply();
              }
            };

            $scope.playPrevious = function () {
              $scope.pause();
              var prevId = ($scope.onPreviousLoadVideoId || angular.noop)({currentId : $scope.videoid});
              if (prevId && $scope.player) {
                $scope.stop();
                $scope.videoid = prevId;
                $scope.player.loadVideoById($scope.videoid);
                $scope.$apply();
              }
            };

            $scope.resizeVideo = function (dimensions) {
              if ($scope.player) {
                $scope.player.setSize(dimensions.width, dimensions.height);
              }
            };

          }],
          template   : '' +
            '<div class="video-view" style="position:relative;width:100%;height:100%;line-height:0;padding:0;margin:0;top:0;left:0;bottom:0;right:0" ng-style="wrapperStyles">' +
            '<div class="video-view-content" style="position:absolute;z-index:5;width:100%;height:100%;line-height:0;padding:0;margin:0;top:0;left:0;bottom:0;right:0">' +
            '<div class="video-view-error" ng-if="videoError">Error occured!</div>' +
            '<div class="video-view-loader" ng-if="videoIsLoading">Loading ...</div>' +
            '<div class="video-view-iframe"></div>' +
            '</div>' +
            '<div class="video-view-content-cover" style="position:absolute;z-index:-1;width:100%;height:100%;line-height:0;padding:0;margin:0;top:0;left:0;bottom:0;right:0"></div>' +
            '<div class="video-view-content-cover-block a" style="position:absolute;z-index:6"></div>' +
            '<div class="video-view-content-cover-block b" style="position:absolute;z-index:6"></div>' +
            '<div class="video-view-content-cover-block c" style="position:absolute;z-index:6"></div>' +
            '<div class="video-view-content-cover-block d" style="position:absolute;z-index:6"></div>' +
            '<div class="video-view-content-cover-block-small a" style="position:absolute;z-index:7"></div>' +
            '<div class="video-view-content-cover-block-small b" style="position:absolute;z-index:7"></div>' +
            '<div class="video-view-content-cover-block-small c" style="position:absolute;z-index:7"></div>' +
            '<div class="video-view-content-cover-block-small d" style="position:absolute;z-index:7"></div>' +
            '<div class="video-view-controls-wrapper" style="position:absolute;z-index:10">' +

            '<div class="video-view-controls top"></div>' +
            '<div class="video-view-controls bottom"></div>' +
            '<div class="video-view-controls back"></div>' +

            '<div class="video-view-controls">' +

            '<div class="video-view-controls-palyback">' +
            '<button class="video-previous" ng-click="playPrevious()"><span class="glyphicon glyphicon-step-backward"></span></button>' +
            '<button ng-if="playerState!=(1||3)" class="video-play" ng-click="play()"><span class="glyphicon glyphicon-play"></span></button>' +
            '<button ng-if="playerState==(1||3)" class="video-pause" ng-click="pause()"><span class="glyphicon glyphicon-pause"></span></button>' +
            '<button class="video-next" ng-click="playNext()"><span class="glyphicon glyphicon-step-forward"></span></button>' +
            '</div>' +

            '<div class="video-view-controls-middle">' +

            '<div class="video-view-controls-audio">' +
            '<div class="video-audio-container">' +
            '<div class="video-audio-container-touch-area"></div>' +
            '<div class="video-audio-volume" style="width: {{volumePercent}}%;">' +
            '<div class="video-audio-volume-knob" style="-webkit-user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); touch-action: none;">' +
            '<div class="video-audio-volume-value" ng-show="volumePercent">{{volumePercent}}</div>' +
            '<div class="video-audio-volume-knob-area"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>' +

            '<div class="video-view-controls-time">' +
            '<div class="video-time-current">{{timeElapsed}}</div>' +
            '<div class="video-time-container">' +
            '<div class="video-time-container-touch-area"></div>' +
            '<div class="video-buffer-line" style="width: {{bufferPercent}}%;"></div>' +
            '<div class="video-time-line" style="width: {{progressPercent}}%;">' +
            '<div class="video-time-knob" style="-webkit-user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); touch-action: none;">' +
            '<div class="video-time-value" ng-show="progressPrettyTime">{{progressPrettyTime}}</div>' +
            '<div class="video-time-knob-area"></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div class="video-time-total">{{timeTotal}}</div>' +
            '</div>' +

            '</div>' +

            '<div class="video-view-controls-quality" ng-class="{open:qualityMenuOpen}">' +
            '<button class="video-view-controls-quality-toggler" ng-click="qualityMenuOpen = !qualityMenuOpen">HD</button>' +
            '<ul class="video-view-controls-quality-menu" ng-show="qualityMenuOpen">' +
            '<li ng-repeat="(qIdx,qName) in playbackQualities" ng-class="{available:(playbackQualitiesAvailable.indexOf(qIdx) > -1), chosen:playbackQualityChosen===qIdx, active:playbackQualityActive===qIdx}">' +
            '<button ng-click="setVideoQuality(qIdx)">{{qName}}</button>' +
            '</li>' +
            '</ul>' +
            '</div>' +

            '</div>' +
            '</div>' +
            '</div>'
        };
      }
    ]);
})(undefined, angular, Hammer, jQuery);