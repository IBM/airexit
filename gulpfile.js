var gulp = require('gulp'),
    usemin = require('gulp-usemin'),
    connect = require('gulp-connect'),
    watch = require('gulp-watch'),
    minifyCss = require('gulp-cssnano'),
    minifyJs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    minifyHTML = require('gulp-htmlmin');

var paths = {
    scripts: 'src/js/**/*.js',
    styles: 'src/styles/**/*.*',
    directives_styles: 'src/js/directives/**/*.css',
    images: 'src/img/**/*.*',
    templates: ['src/templates/**/*.html','src/js/modals/**/*.html'],
    index: 'src/index.html',
    bower_fonts: 'bower_components/**/*.{ttf,woff,woff2,eot,svg}',
	  bower_scripts: 'bower_components/**/*.min.js',
	  bower_styles: 'bower_components/**/*.min.css',
    lib: 'src/lib/**/*.js'
};

var orderedBowerComponents = function() {
  return [
    'bower_components/jquery/dist/*.min.js',
    'bower_components/bootstrap/dist/js/*.min.js',
    'bower_components/angular/angular.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'bower_components/angular-animate/*.min.js',
    'bower_components/angular-cookies/*.min.js',
    'bower_components/angular-growl-v2/**/*.min.js',
    'bower_components/angular-sanitize/*.min.js',
    'bower_components/angular-ui-router/**/*.min.js',
    'bower_components/angular-svg-round-progressbar/**/*.min.js',
    'bower_components/angular-loading-bar/build/loading-bar.min.js',
    'bower_components/crypto-js/crypto-js.js',
    'bower_components/moment/min/moment-with-locales.js',
    'bower_components/angular-moment/angular-moment.js',
    'bower_components/json-formatter/dist/json-formatter.min.js',
    'bower_components/webcam/dist/webcam.min.js'
  ]
}

/**
 * Handle bower components from index
 */
gulp.task('usemin', function() {
    return gulp.src(paths.index)
        .pipe(usemin())
        .pipe(gulp.dest('dist/'));
});

/**
 * Copy assets
 */
gulp.task('build-assets', ['copy-bower_fonts']);

gulp.task('copy-bower_fonts', function() {
    return gulp.src(paths.bower_fonts)
        .pipe(rename({
            dirname: '/fonts'
        }))
        .pipe(gulp.dest('dist/lib'));
});

/**
 * Handle custom files
 */
gulp.task('build-custom', ['custom-images', 'custom-js', 'custom-styles',
                           'custom-templates', 'concat-vendor-js', 'concat-vendor-css']);

gulp.task('custom-images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('dist/img'));
});

gulp.task('custom-js', function() {
    return gulp.src(paths.scripts)
        //.pipe(minifyJs())
        .pipe(concat('dashboard.min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('concat-vendor-js', function() {
    return gulp.src(orderedBowerComponents().concat([paths.lib]))
        //.pipe(minifyJs())
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('dist/lib/js'));
});

gulp.task('concat-vendor-css', function() {
    return gulp.src(paths.bower_styles)
        .pipe(minifyCss({keepSpecialComments: 0}))
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest('dist/lib/css'));
});

gulp.task('custom-styles', function() {
    return gulp.src([paths.styles, paths.directives_styles])
        .pipe(less())
        .pipe(concat('dashboard.min.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('custom-templates', function() {
    return gulp.src(paths.templates)
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist/templates'));
});

/**
 * Watch custom files
 */
gulp.task('watch', function() {
    gulp.watch([paths.images], ['custom-images']);
    gulp.watch([paths.styles, paths.directives_styles], ['custom-styles']);
    gulp.watch([paths.scripts], ['custom-js']);
    gulp.watch([paths.templates], ['custom-templates']);
    gulp.watch([paths.index], ['usemin']);
	  gulp.watch([paths.bower_scripts], ['concat-vendor-js']);
	  gulp.watch([paths.bower_styles], ['concat-vendor-css']);
});

/**
 * Live reload server
 */
gulp.task('webserver', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        port: 8997
    });
});

gulp.task('livereload', function() {
    gulp.src(['dist/**/*.*'])
        .pipe(watch(['dist/**/*.*']))
        .pipe(connect.reload());
});

var fs = require('fs');
const spawn = require('child_process').spawn;
const Q = require('q');

var runCheckProcess = function(name, args, validate) {
  var defer = Q.defer();
  var child = spawn(name, args);
  var index = 0;
  var result = false;
  child.stdout.on('data', (data) => {
     if (validate.index || validate.index == 0) {
       if (index != validate.index ) {
         index++;
         return;
       }
       if (data.indexOf(validate.text) != -1) {
         result = true;
       }
       else {
         result = false;
       }
       index++;
     }
     else {
       if (data.indexOf(validate) != -1) {
         result = true;
       }
       else {
         result = result || false;
       }
     }
  });

  child.stderr.on('data', (data) => {
    result = {error: data}
  });

  child.on('close', (code) => {
    if (result.error) {
        defer.reject(result.error);
    } else {
      defer.resolve(result);
    }
  });

  return defer.promise;
}

var runProcess = function(name, args) {
  var defer = Q.defer();
  var child = spawn(name, args);
  child.stdout.pipe(process.stdout);

  child.on('close', (code) => {
      defer.resolve(code);
  });

  return defer.promise;
}

function isLoggedInToBluemix() {
  return runCheckProcess('bluemix', ['target'], { index: 1, text: 'Not logged in'}).then(function(notLoggedIn) {
    console.log('Is logged in bluemix');
    return !notLoggedIn;
  }, function(reason) {
    console.log('Is not logged in bluemix');
    return Q.reject(reason);
  });
}

function isTargetTest() {
  return runCheckProcess('bluemix', ['target'], 'silvergate-squads-app-test');
}

function isLoggedInToCloudFoundry() {
  return runCheckProcess('cf', ['target'], 'Not logged in').then(function(notLoggedIn) {
    console.log('Is logged in cf');
    return !notLoggedIn;
  }, function(reason) {
    console.log('Not logged in cf');
    return Q.reject(reason);
  });
}

var setConfigFor = function(environment) {
  if (environment == 'production' || environment == 'development' || environment == 'test') {
    var lookFor = '';
    fs.readFile('server/config.json', 'utf8', function (err,data) {
      if (err) {
        return console.log('Error reading config.json file: ', err);
      }
      var regex;
      if (data.indexOf('"environment_mode": "development"') != -1) {
        regex = new RegExp('"environment_mode": "development"', 'g');
      }
      if (data.indexOf('"environment_mode": "production"') != -1) {
        regex = new RegExp('"environment_mode": "production"', 'g');
      }
      if (data.indexOf('"environment_mode": "test"') != -1) {
        regex = new RegExp('"environment_mode": "test"', 'g');
      }
      var result = data.replace(regex, '"environment_mode": "'+environment+'"');

      fs.writeFile('server/config.json', result, 'utf8', function (err) {
         if (err) return console.log(err);
      });
    });
  }
  else {
    console.log('Wrong argument environment should be "production", "test" or "development"');
  }
};

gulp.task('deploy', function() {
  var target, prodIndex = process.argv.indexOf('--prod');
	if(prodIndex > -1) {
	   target = process.argv[prodIndex];
	}
  if (target == '--prod') {
    console.log('Deploying to prod...');
    isLoggedInToBluemix().then(function(loggedIn){
      if (loggedIn) {
        isLoggedInToCloudFoundry().then(function(cfLoggedIn){
          if (cfLoggedIn) {
            setConfigFor('production');
            runProcess('cf', ['push','silvergate-squads-app']).then(function() {
              setConfigFor('development');
              runProcess('cf', ['logout']);
              console.log('Done!');
            });
          }
          else {
            console.log('\x1b[31m', 'Please login to cf first.');
            console.log('\x1b[0m', 'Run: cf login');
          }
        });
      }
      else {
        console.log('\x1b[31m', 'Please login to bluemix first.');
        console.log('\x1b[0m', 'Run: bluemix login');
      }
    }, function(reson) {
      console.log('Error: ', reason);
    });
  }
  else {
    console.log('Deploying to test...');
    isLoggedInToBluemix().then(function(loggedIn){
      if (loggedIn) {
        isTargetTest().then(function(targetTest){
          if (targetTest) {
            isLoggedInToCloudFoundry().then(function(cfLoggedIn){
              if (cfLoggedIn) {
                setConfigFor('test');
                runProcess('cf', ['push','test-silvergate-squads-app']).then(function() {
                  setConfigFor('development');
                  console.log('Done!');
                });
              }
              else {
                console.log('\x1b[31m', 'Please login to cf first.');
                console.log('\x1b[0m', 'Run: cf login');
              }
            });
          }
          else {
            console.log('\x1b[31m', 'The target org selected is not silvergate-connectionCoach-Test');
            console.log('\x1b[0m', 'Run: bluemix target -o silvergate-connectionCoach-Test] -s silvergate-connectionCoach-Test');
          }
        });
      }
      else {
        console.log('\x1b[31m', 'Please login to bluemix first.');
        console.log('\x1b[0m', 'Run: bluemix login');
      }
    }, function(reson) {
      console.log('Error: ', reason);
    });
  }

});

/**
 * Gulp tasks
 */
gulp.task('build', ['usemin', 'build-assets', 'build-custom']);
gulp.task('default', ['build', 'webserver', 'livereload', 'watch']);
