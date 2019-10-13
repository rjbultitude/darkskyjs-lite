'use strict';

var buffer          = require('vinyl-buffer');
var config          = require('../config');
var gulp            = require('gulp');
var path            = require('path');
var stripDebug      = require('gulp-strip-debug');
var uglify          = require('gulp-uglify');
var util            = require('gulp-util');
var browserify      = require('browserify');
var source          = require('vinyl-source-stream');
var errorHandler    = require('../utilities/errorHandler');

var filename        = 'darksky.js';

var bundler = browserify({
    entries: [path.join(config.scripts.src, filename)],
    debug: !config.production,
    cache: {},
    packageCache: {},
    fullPaths: true
});

// What Browserify should do when building the bundle
function bundle() {
    console.log('in');
    return bundler.bundle()
        // log errors if they happen
        .on('error', errorHandler)
        .pipe(source(filename))
        .pipe(buffer())
        .pipe(config.production ? stripDebug() : util.noop())
        .pipe(config.production ? uglify() : util.noop())
        .pipe(gulp.dest(config.scripts.dist));
}

gulp.task('scripts', bundle);
