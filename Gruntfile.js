module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      dev: {
        options: {
          jshintrc: true
        },
        src: ['*.js', 'app/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'models/**/*.js'],
      },
    },
    watch: {
      grunt: { files: ['Gruntfile.js'] },
      options: {
        livereload: true
      },
      files: ['*.js', 'app/**/*.js', 'lib/**/*.js', 'test/**/*.js', 'models/**/*.js'],
      tasks: ['jshint:dev']
    },
    apidoc: {
      apiStarter: {
        src: "app/",
        dest: "docs/",
        options : {
          includeFilters: [ ".*\\.js$" ],
          excludeFilters: [ "node_modules/" ]
        }
      }
    }

  });


 grunt.loadNpmTasks('grunt-contrib-jshint');
 grunt.loadNpmTasks('grunt-contrib-watch');
 grunt.loadNpmTasks('grunt-apidoc');

 grunt.registerTask('default', ['apidoc', 'jshint:dev']);
};
