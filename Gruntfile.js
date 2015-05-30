module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['build']);
  grunt.registerTask('dev', ['express', 'build', 'watch']);
  grunt.registerTask('build', [
    'clean',
    'copy',
    'ngAnnotate',
    'uglify',
    'less',
    'cssmin'
    ]);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ['public_html'],

    watch: {
      clientJs: {
        files: 'client/*.js',
        tasks: ['ngAnnotate', 'uglify:core', 'watch']
      },
      clientLess: {
        files: 'client/*.less',
        tasks: ['less', 'cssmin', 'watch']
      },
      clientHtml: {
        files: ['client/*.html', 'client/assets/*.html'],
        tasks: ['copy:client', 'watch']
      },
      server: {
        files: ['server/*', 'config.json', 'app.js'],
        tasks: ['express:main', 'watch'],
        options: {
          spawn: false
        }
      }
    },

    copy: {
      client: {
        files: [
        {
          dest: 'public_html/',
          cwd: 'client/',
          expand: true,
          src: [
          'index.html',
          'assets/**.html'
          ]
        }
        ]
      },
      fonts: {
        files: [
        {
          dest: 'public_html/',
          cwd: 'node_modules/bootstrap/',
          expand: true,
          src: [
          'fonts/**'
          ]
        }
        ]
      }
    },

    express: {
      main: {
        options: {
          script: 'app.js'
        }
      }
    },

    less: {
      main: {
        options: {
          plugins: [
          new (require('less-plugin-autoprefix'))({browsers: ["last 2 versions"]})
          ],
          paths: [
          'node_modules/bootstrap/less'
          ]
        },
        files: {
          'public_html/assets/dashboard.css': [
          'client/dashboard.less'
          ]
        }
      }
    },

    cssmin: {
      client: {
        files: {
          'public_html/assets/dashboard.css': [
          'node_modules/bootstrap/dist/css/bootstrap.css',
          'node_modules/bootstrap/dist/css/bootstrap-theme.css',
          'public_html/assets/dashboard.css'
          ]
        }
      }
    },

    ngAnnotate: {
      options: {
        singleQuotes: true,
      },
      client: {
        files: {
          'public_html/assets/ng-dashboard.js': ['client/dashboard.js']
        }
      }
    },

    uglify: {
      deps: {
        options: {
          mangle: false
        },
        files: {
          'public_html/assets/libs.js': [
          'node_modules/jquery/dist/jquery.js',
          'node_modules/angular/angular.js',
          'node_modules/noty/js/noty/packaged/jquery.noty.packaged.js',
          'node_modules/bootstrap/dist/js/bootstrap.js',
          'node_modules/angular-route/angular-route.js'
          ]
        }
      },
      core: {
        options: {
          mangle: false
        },
        files: {
          'public_html/assets/dashboard.js': [
          'public_html/assets/ng-dashboard.js'
          ]
        }
      }
    }

  });
};
