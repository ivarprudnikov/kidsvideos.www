'use strict';

(function(angular){
  var app = angular.module('com.ivarprudnikov.ng.config', []);

  app.constant('configuration', {
    app: {
      baseUrl: '@@appUrl'
    },
    auth: {
      blank: '@@apiUrl/api/auth/blank',
      login: '@@apiUrl/api/auth/login',
      tokenHeaderName: 'Authorization',
      socialEnabled: true,
      formEnabled: false
    },
    api: {
      baseUrl: '@@apiUrl',
      public: {
        path: '/api/v1/client',
        videoSearch: '@@apiUrl/api/v1/client/video/search',
        videoCheck: '@@apiUrl/api/v1/client/video/check',
        playlistPath: '@@apiUrl/api/v1/client/playlist'
      }
    }
  });

})(angular);