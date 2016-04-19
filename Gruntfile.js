'use strict';

var request = require('request');

module.exports = function (grunt) {

  require('time-grunt')(grunt);

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
          'bower_components/foundation-sites/dist/foundation.js',
          'src/app/js/**/*.js'
        ],
        dest: 'static/js/vendor.js',
        nonull: true
      }
    },

    uglify: {
      options: {
        preserveComments: 'some',
        sourceMap: true
      },
      build: {
        files: {
          'static/js/scripts.min.js': 'static/js/scripts.js',
          'static/js/vendor.min.js': 'static/js/vendor.js'
        }
      }
    },

    watch: {
      js: {
        files: ['js/**/*.js'],
        tasks: ['concat','uglify'],
        options: {
          spawn: false
        }
      },

      css: {
        files: ['scss/**/*.scss'],
        tasks: ['sass'],
        options: {
          spawn: false
        }
      }
    },
    browserSync: {
      dev: {
        bsFiles: {
          src : [
            'public/**/*',
            'app.js',
            'lib/**/*.js'
          ],
        },
        options: {
          proxy: 'localhost:3333',
          watchTask: true,
          debugInfo: true,
          logConnections: true,
          notify: true
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

  grunt.registerTask('default', ['sass','concat','uglify','browserSync','watch']);
  grunt.registerTask('compile', ['sass','concat','uglify']); // TODO: Proper compile, auto-prefixer, etc.
  grunt.registerTask('deploy', []); // TODO: Proper deploy to platform of choice

};
