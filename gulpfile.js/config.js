'use strict';

var path = require('path');
var util = require('gulp-util');

module.exports = {
    production: !!util.env.production,
    scripts: {
        dist:  path.join('dist'),
        src:   path.join('lib')
    }
};
