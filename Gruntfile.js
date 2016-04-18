'use strict';

var request = require('request');

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  var reloadPort = 35729, files;

  grunt.initConfig({

    sass: {
      options: {
        sourcemap: 'auto', 
        compass: true,
        style: 'expanded',
        precision: 3,
        loadPath: [
          'bower_components/foundation-sites/scss',
          'bower_components/motion-ui/src'
        ]
      },
      build: {
        files: {
          'static/css/style.css': 'scss/main.scss'
        }
      }
    },

    jshint: {
      options: {
        globals: {
          jQuery: true
        }
      },
      build: {
        files: {
          src: ['src/app/js/**/*.js']
        }
      }
    },

    concat: {
      build: {
        src: [
//          'bower_components/include-media-export/include-media.js',
          'src/app/js/**/*.js'
        ],
        dest: 'static/js/vendor.js',
        nonull: true
      }
    },

    uglify: {
      options: {
        preserveComments: 'some'
      },
      build: {
        files: {
          'static/js/scripts.min.js': 'static/js/scripts.js',
          'static/js/vendor.min.js': 'static/js/vendor.js'
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-browser-sync');

  grunt.registerTask('default', ['sass','uglify']);
};
