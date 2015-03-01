'use strict';

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks("grunt-jscoverage");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  var src = ['test/core/domainDaoSupport.js', 'test/connection/cache/*.js',
    'test/connection/sql/*.js', 'test/template/cache/*.js', 'test/util/*.js',
    'test/bearcat-dao.js', 'test/loader/*.js', 'test/aspect/*.js'
  ];

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    jscoverage: {
      options: {
        inputDirectory: 'lib',
        outputDirectory: 'lib-cov'
      }
    },
    mochaTest: {
      dot: {
        options: {
          reporter: 'dot',
          timeout: 100000,
          require: 'coverage/blanket'
        },
        src: src
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: src
      }
    },
    clean: {
      "coverage.html": {
        src: ['coverage.html']
      }
    },
    jshint: {
      all: ['lib/*']
    }
  });
  // Default task.
  // grunt.registerTask('default', ['clean', 'jscoverage', 'mochaTest:dot', 'jshint:all']);
  grunt.registerTask('default', ['clean', 'jscoverage', 'mochaTest']);
};