module.exports = function (grunt) {
    var sassFilesArray = [{
        expand: true,
        cwd: 'public',
        src: ['src/scss/**/*.scss', '!src/scss/**/_*.scss'],
        rename: function(destBase, destPath, options) {
            return options.cwd + '/' + destPath.replace(/^src\/scss/, 'compiled/css').replace(/\.scss/, '.css');
        }
    }];

    // Project configuration.
    grunt.initConfig({
        staticPath: 'public/src',

        // Store your Package file so you can reference its specific data whenever necessary
        pkg: grunt.file.readJSON('package.json'),

        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    port: 8000,
                    script: './server.js',
                    node_env: 'development'
                }
            }
        },
        sass: {
            options: {
                sourcemap: 'none',
                precision: 8,
                includePaths: [
                    'node_modules'
                ]
            },
            dev: {
                files: sassFilesArray,
                options: {
                    sourcemap: 'auto',
                    style: 'nested'
                }
            },
            dist: {
                files: sassFilesArray,
                options: {
                    style: 'compressed'
                }
            }
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['<%=staticPath%>/images/**'],
                        dest: 'public/compiled/images',
                        rename: function(dest, src) {
                            return dest + src.replace('public/src/images', '');
                        }
                    },
                ],
            },
        },

        // Run: `grunt watch` from command line for this section to take effect
        watch: {
            options: {
                nospawn: true,
                spawn: false
            },
            sass: {
                files: ['<%=staticPath%>/scss/**/*.scss'],
                tasks: ['sass:dev', 'asset_hash'],
                livereload: true
            },
            images: {
                files: ['<%=staticPath%>/images/**/*.*'],
                tasks: ['copy', 'asset_hash']
            },
            express: {
                files:  [
                    'config/**/*.js',
                    'controllers/**/*.js',
                    'helpers/**/*.js',
                    'models/**/*.js',
                    'utils/**/*.js',
                ],
                tasks:  [ 'express:dev' ]
            }
        },
        asset_hash: {
            options: {
                preserveSourceMaps: false,
                assetMap: 'assetmap.json',
                hashLength: 32,
                algorithm: 'md5',
                srcBasePath: 'public/compiled/',
                destBasePath: 'public/dist/',
                hashType: 'file',
                references: ['public/dist/**/*.css']
            },
            main: {
                files: [
                    {
                        src:  ['public/compiled/**/*'],
                        dest: 'public/dist'
                    }
                ]
            },
        },

    });

    // Load NPM Tasks
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-asset-hash');


    // Default Task
    grunt.registerTask('default', ['sass:dev','copy','asset_hash','express:dev','watch']);

    // Build Task
    grunt.registerTask('build', ['sass:dist']);
};