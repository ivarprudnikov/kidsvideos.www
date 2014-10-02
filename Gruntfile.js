'use strict';

var LIVERELOAD_PORT = 35728;
var lrSnippet = require('connect-livereload')({ port : LIVERELOAD_PORT });

var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);

  // configurable paths
  var yeomanConfig = {
    app      : 'dev',
    dist     : 'prod',
    tplsFile : 'generatedTemplates.js',
    cfgFile  : 'generatedConfiguration.js'
  };

  grunt.initConfig({

    yeoman       : yeomanConfig,

    // *.less files processing
    ////////////////////////////
    less         : {
      development : {
        options : {
          paths : ['<%= yeoman.app %>']
        },
        files   : [
          {
            expand : true,
            cwd    : '<%= yeoman.app %>/apps',
            src    : ['*/styles/core.less'],
            dest   : '<%= yeoman.app %>/apps',
            ext    : '.css'
          }
        ]
      }
    },

    // prefixing css styles
    // for wider browser support
    ////////////////////////////
    autoprefixer : {
      options : ['last 10 version', 'ie 9'],
      dist    : {
        files : [
          {
            expand : true,
            cwd    : '.tmp',
            src    : '**/*.css',
            dest   : '.tmp'
          },
          {
            expand : true,
            cwd    : '<%= yeoman.app %>/apps/',
            src    : '**/*.css',
            dest   : '<%= yeoman.app %>/apps/'
          }
        ]
      }
    },

    watch : {
      styles     : {
        files : ['<%= yeoman.app %>/apps/**/*.less'],
        tasks : ['less', 'copy:styles', 'autoprefixer']
      },
      ngTemplates     : {
        files : ['<%= yeoman.app %>/apps/**/*.html'],
        tasks : ['ngtemplates']
      },
      livereload : {
        options : {
          livereload : LIVERELOAD_PORT
        },
        files   : [
          '{.tmp,<%= yeoman.app %>}/apps/**/*.html',
          '<%= yeoman.app %>/apps/**/*.less',
          '{.tmp,<%= yeoman.app %>}/apps/**/*.css',
          '{.tmp,<%= yeoman.app %>}/apps/**/*.js',
          '{.tmp,<%= yeoman.app %>}/apps/**/*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    connect : {
      options    : {
        port     : 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname : 'localhost'
      },
      livereload : {
        options : {
          middleware : function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test       : {
        options : {
          middleware : function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      },
      dist       : {
        options : {
          middleware : function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },

    // handy operation for opening browser
    // window after dev server starts
    // running
    ///////////////////////////////////////
    open    : {
      server : {
        url : 'http://localhost:<%= connect.options.port %>/apps/'
      }
    },

    // clean task
    ///////////////////////////////////////
    clean   : {
      dist   : {
        files : [
          {
            dot : true,
            src : [
              '.tmp',
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server : '.tmp'
    },

    // code quality checks
    ///////////////////////////////////////
    jshint  : {
      options : {
        jshintrc : '.jshintrc'
      },
      all     : [
        'Gruntfile.js',
        '<%= yeoman.app %>/apps/**/*.js',
        '!<%= yeoman.app %>/**/<%= yeoman.tplsFile %>',
        '!<%= yeoman.app %>/**/<%= yeoman.cfgFile %>'
      ]
    },

    jscs          : {
      options : {
        config : '.jscsrc'
      },
      all     : [
        'Gruntfile.js',
        '<%= yeoman.app %>/apps/**/*.js',
        '!<%= yeoman.app %>/**/<%= yeoman.tplsFile %>',
        '!<%= yeoman.app %>/**/<%= yeoman.cfgFile %>'
      ]
    },

    // not used since Uglify task does concat,
    // but still available if needed
    /*concat: {
     dist: {}
     },*/

    // hash files
    ///////////////////////
    filerev       : {
      dist : {
        src : [
          '<%= yeoman.dist %>/apps/*/views/*.html',
          '<%= yeoman.dist %>/apps/**/*.js',
          '<%= yeoman.dist %>/apps/**/*.css',
          '<%= yeoman.dist %>/apps/**/*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/apps/_shared/fonts/*'
        ]
      }
    },

    // apply a configured transformation
    // flow to tagged files
    /////////////////////////////
    useminPrepare : {
      html    : '<%= yeoman.app %>/apps/{*/index.html,index.html}',
      options : {
        srcStrip : '<%= yeoman.app %>', // remvoe 'dev' so that files go into dist/x instead of dist/dev/x
        //root: '<%= yeoman.app %>', overrides actual file source path
        dest     : '<%= yeoman.dist %>',
        flow     : {
          steps : {
            js  : ['concat'],
            css : ['concat']
          },
          post  : {}
        }
      }
    },

    usemin      : {
      html    : ['<%= yeoman.dist %>/**/*.html'],
      css     : ['<%= yeoman.dist %>/**/*.css'],
      options : {
        dirs : ['<%= yeoman.dist %>']
      }
    },

    // compress images
    ///////////////////////
    imagemin    : {
      dist : {
        files : [
          {
            expand : true,
            cwd    : '<%= yeoman.app %>',
            src    : 'apps/**/*.{png,jpg,jpeg}',
            dest   : '<%= yeoman.dist %>'
          }
        ]
      }
    },
    svgmin      : {
      dist : {
        files : [
          {
            expand : true,
            cwd    : '<%= yeoman.app %>',
            src    : 'apps/**/*.svg',
            dest   : '<%= yeoman.dist %>'
          }
        ]
      }
    },

    // compress css
    ///////////////////////
    cssmin      : {
      options : {
        banner : 'bang!',
        report : 'min'
      },
      dist    : {
        files : [
          {
            expand : true,
            cwd    : '<%= yeoman.dist %>',
            src    : '**/*.css',
            dest   : '<%= yeoman.dist %>'
          }
        ]
      }
    },

    // compress html
    ///////////////////////
    htmlmin     : {
      dist : {
        options : {
          /*removeCommentsFromCDATA: true,
           // https://github.com/yeoman/grunt-usemin/issues/44
           //collapseWhitespace: true,
           collapseBooleanAttributes: true,
           removeAttributeQuotes: true,
           removeRedundantAttributes: true,
           useShortDoctype: true,
           removeEmptyAttributes: true,
           removeOptionalTags: true*/
        },
        files   : [
          {
            expand : true,
            cwd    : '<%= yeoman.app %>',
            src    : ['apps/**/*.html'],
            dest   : '<%= yeoman.dist %>'
          }
        ]
      }
    },

    // convert js links from local to cdn
    ///////////////////////////////////////
    cdnify      : {
      dist : {
        html : ['<%= yeoman.dist %>/**/*.html']
      }
    },

    // angular pre-minificator
    ///////////////////////////////////////
    ngmin       : {
      dist : {
        files : [
          {
            expand : true,
            cwd    : '<%= yeoman.dist %>',
            src    : '**/app.js',
            dest   : '<%= yeoman.dist %>'
          }
        ]
      }
    },

    // angular templates
    // extract all templates and create
    // separate module for later injection
    ///////////////////////////////////////
    ngtemplates : {
      appTemplates : {
        cwd     : '<%= yeoman.app %>',
        src     : '**/views/*.html',
        dest    : '<%= yeoman.app %>/apps/_shared/scripts/<%= yeoman.tplsFile %>',
        options : {
          standalone : true
        }
      }
    },

    // uglify js files
    ///////////////////////////////////////
    uglify      : {
      dist : {
        files : [
          {
            expand : true,
            cwd    : '<%= yeoman.dist %>',
            src    : '**/*.js',
            dest   : '<%= yeoman.dist %>'
          }
        ]
      }
    },

    // Put files not handled in other tasks here
    copy        : {
      dist   : {
        files : [
          {
            expand : true,
            dot    : true,
            cwd    : '<%= yeoman.app %>',
            dest   : '<%= yeoman.dist %>',
            src    : [
              '*.{ico,png,txt}',
              '.htaccess',
              'apps/**/*.{gif,webp}',
              'apps/_shared/fonts/*',
              '!bower_components'
            ]
          },
          {
            expand : true,
            cwd    : '.tmp/apps',
            dest   : '<%= yeoman.dist %>/apps',
            src    : [
              'generated/*'
            ]
          }
        ]
      },
      styles : {
        expand : true,
        cwd    : '<%= yeoman.app %>/apps',
        dest   : '.tmp/apps/',
        src    : '**/*.css'
      }
    },

    // environment specific configuration
    ///////////////////////////////////////
    replace: {
      dev: {
        options: {
          patterns: [{ json: grunt.file.readJSON('./package.json').appConf.dev }]
        },
        files: { '<%= yeoman.app %>/apps/_shared/scripts/<%= yeoman.cfgFile %>':'./configuration.template.js' }
      },
      dist: {
        options: {
          patterns: [{ json: grunt.file.readJSON('./package.json').appConf.prod }]
        },
        files: { '<%= yeoman.app %>/apps/_shared/scripts/<%= yeoman.cfgFile %>':'./configuration.template.js' }
      }
    },

    // concurrent tasks
    ///////////////////////////////////////////////
    concurrent  : {
      server : [],
      test   : [],
      dist   : []
    },

    // Testing
    ///////////////////////////////////////////////
    karma       : {
      unit : {
        configFile : 'test/karma.conf.js',
        singleRun  : true
      }
    }

  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'replace:dev',      // prepare config
      'less',
      'copy:styles',
      'autoprefixer',
      'ngtemplates',      // compress all template files into single ng module cache
      'connect:livereload',
      'open',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'jshint',           // code quality check
    'jscs',             // code quality check
    'clean:server',     // erase .tmp
    'replace:dev',      // prepare config
    'less',             // generates css in dev
    'copy:styles',      // copy css to .tmp
    'autoprefixer',     // adds prefixes in .tmp
    'ngtemplates',      // compress all template files into single ng module cache
    'connect:test',     // run server and mount folders
    'karma'             // run tests
  ]);

  grunt.registerTask('build', [
    'jshint',           // code quality check
    'jscs',             // code quality check
    'clean:dist',       // cleans .tmp & dist
    'replace:dist',     // prepare config
    'less',             // generates css in dev
    'autoprefixer',     // adds prefixes in dev
    'ngtemplates',      // compress all template files into single ng module cache
    'useminPrepare',    // prepares build steps for html blocks
    'concat',           // concatinates files and moves them to dist
    'cssmin',           // minifies css in dist
    'imagemin',         // minifies images and moves them to dist
    'svgmin',           // minifies svg and moves them to dist
    'htmlmin',          // minifies html and moves them to dist
    'copy:dist',        // copies previously unhandled files to dist
    'ngmin',            // pre-minifies angular files in dist
    'uglify',           // minifies & uglifies js files in dist
    'filerev',          // hashes js/css/img/font files in dist
    'usemin'
  ]);

  grunt.registerTask('default', [
    'test',
    'build'
  ]);
};
