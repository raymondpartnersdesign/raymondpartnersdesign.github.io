/* eslint-disable */
const fs             = require('fs'),
      path           = require('path'),
      gulp           = require('gulp'),
      log            = require('fancy-log'),
      newer          = require('gulp-newer'),
      runSequence    = require('run-sequence'),
      sass           = require('gulp-sass'),
      cssImporter    = require('node-sass-css-importer')({
        import_paths: ['./scss'] }),
      autoprefixer   = require('gulp-autoprefixer'),
      cleanCSS       = require('gulp-clean-css'),
      replace        = require('gulp-replace'),
      del            = require('del'),
      eslint         = require('gulp-eslint'),
      htmlPrettify   = require('gulp-prettify'),
      concat         = require('gulp-concat'),
      browserSync    = require('browser-sync'),
      rename         = require('gulp-rename'),
      babel          = require('gulp-babel'),
      embedSvg       = require('gulp-embed-svg'),
      sourcemaps     = require('gulp-sourcemaps'),
      uglify         = require('gulp-uglify'),
      reload         = browserSync.reload,
      browsers       = "Safari > 10, Firefox > 40, Chrome > 40, ie >= 11";

const paths = {
          here: './',
          pages: {
              folder: 'pages',
              all: ['pages/**/*'],
              html: 'pages/*.html',
              includes: 'pages/include/',
              layouts: 'pages/layouts'
          },
          js: {
              all: "js/**/*",
              bootstrap: [
                "./js/bootstrap/util.js",
                "./js/bootstrap/alert.js",
                "./js/bootstrap/button.js",
                "./js/bootstrap/carousel.js",
                "./js/bootstrap/collapse.js",
                "./js/bootstrap/dropdown.js",
                "./js/bootstrap/modal.js",
                "./js/bootstrap/tooltip.js",
                "./js/bootstrap/popover.js",
                "./js/bootstrap/scrollspy.js",
                "./js/bootstrap/tab.js"
              ],
              mrare: "js/mrare/**/*.js",
          },
          scss: {
              folder: 'scss',
              all: 'scss/**/*',
              root: 'scss/*.scss',
              themeScss: ['scss/theme.scss', '!scss/user.scss', '!scss/user-variables.scss' ],
          },
          assets: {
              all: 'pages/assets/**/*',
              folder: 'pages/assets',
              allFolders: ['pages/assets/css','pages/assets/img','pages/assets/fonts','pages/assets/video'],
          },
          css: {
              folder: 'assets/css',
          },
          fonts: {
              folder: 'assets/fonts',
              all: 'assets/fonts/*.*',
          },
          images: {
              folder: 'assets/img',
              all: 'assets/img/*.*',
          },
          videos: {
              folder: 'assets/video',
              all: 'assets/video/*.*',
          },
          dist: {
              packageFolder: '',
              folder: 'dist',
              pages: 'dist/pages',
              all: 'dist/**/*',
              assets: 'dist/assets',
              img: 'dist/assets/img',
              css: 'dist/assets/css',
              scssSources: 'dist/scss',
              js: 'dist/assets/js',
              jsSources: 'dist/js',
              fonts: 'dist/assets/fonts',
              video: 'dist/assets/video',
              documentation: 'dist/documentation',
              exclude: ['!**/desktop.ini', '!**/.DS_store'],
          },
          user: {
              folder: 'user',
              all: 'user/**/*'
          },
          copyDependencies:[
            { 
              files: "jquery.min.js",
              from: "node_modules/jquery/dist",
              to: "pages/assets/js"
            },
            {
              files: "jquery.countdown.min.js",
              from: "node_modules/jquery-countdown/dist",
              to: "pages/assets/js"
            },
            {
              files: "jquery.smartWizard.min.js",
              from: "node_modules/smartwizard/dist/js",
              to: "pages/assets/js"
            },
            {
              files: "flickity.pkgd.js",
              from: "node_modules/flickity/dist",
              to: "pages/assets/js"
            },
            {
              files: "flickity.min.css",
              from: "node_modules/flickity/dist",
              to: "pages/assets/css"
            },
            {
              files: "jquery.fancybox.min.css",
              from: "node_modules/@fancyapps/fancybox/dist",
              to: "scss/custom/components/plugins"
            },
            {
              files: "jquery.fancybox.min.js",
              from: "node_modules/@fancyapps/fancybox/dist",
              to: "pages/assets/js"
            },
            {
              files: "isotope.pkgd.min.js",
              from: "node_modules/isotope-layout/dist",
              to: "pages/assets/js"
            },
            {
              files: "popper.min.js",
              from: "node_modules/popper.js/dist",
              to: "pages/assets/js"
            },
            {
              files: "popper.min.js.map",
              from: "node_modules/popper.js/dist/umd",
              to: "pages/assets/js"
            },
            {
              files: "prism.js",
              from: "node_modules/prismjs",
              to: "pages/assets/js"
            },
            {
              files: "prism.css",
              from: "node_modules/prismjs/themes",
              to: "scss/custom/components/plugins"
            },
            {
              files: "prism-okaidia.css",
              from: "node_modules/prismjs/themes",
              to: "scss/custom/components/plugins"
            },
            {
              files: "scrollMonitor.js",
              from: "node_modules/scrollmonitor",
              to: "pages/assets/js"
            },
            {
              files: "smooth-scroll.polyfills.js",
              from: "node_modules/smooth-scroll/dist",
              to: "pages/assets/js"
            },
            {
              files: "zoom-vanilla.min.js",
              from: "node_modules/zoom-vanilla.js/dist",
              to: "pages/assets/js"
            },
            {
              files: "zoom.css",
              from: "node_modules/zoom-vanilla.js/dist",
              to: "scss/custom/components/plugins"
            },
          ] 
      };

// PRETTYFY OPTIONS

const prettifyOptions = {
  condense: false,
  indent_inner_html: true,
  indent_size: 2,
  indent_char: " ",
  unformatted: [
      "code",
      "pre",
      "strong",
      "em",
      "a",
      "b",
      "i",
      "u"
    ],
  preserve_newlines: true,
  max_preserve_newlines: 1,
  brace_style: "expand",
  wrap_line_length: 0,
};

// DEFINE TASKS




gulp.task('build', function(cb){
  return runSequence( 'clean:dist', 'copy-assets', ['html', 'sass-min', 'bootstrapjs', 'mrarejs'], cb);
});

gulp.task('clean:dist', function(done){
  del.sync(paths.dist.all, {force: true});
  done();
});

// Copy html files to dist
gulp.task('html', function(){
    return gulp.src(paths.pages.html)
        .pipe(newer(paths.dist.folder))
        .pipe(embedSvg({ selectors: 'img.icon, img.bg-triangle', root: './pages', attrs: /class/ }))
        .pipe(htmlPrettify(prettifyOptions))
        .pipe(gulp.dest(paths.dist.folder))
        .on('finish', reload);
});

gulp.task('sass', function(){
    return gulp.src(paths.scss.themeScss)
        .pipe(sourcemaps.init())
        .pipe(sass({importer: cssImporter}).on('error', sass.logError))
        .pipe(autoprefixer({browsers}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(reload({ stream:true }));
});

gulp.task('sass-min', gulp.series('sass', function sassMin(){
    return gulp.src(paths.scss.themeScss)
        .pipe(sourcemaps.init())
        .pipe(sass({importer: cssImporter}).on('error', sass.logError))
        .pipe(cleanCSS({compatibility: 'ie9'}))
        .pipe(autoprefixer({browsers}))
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(reload({ stream:true }));
}));



gulp.task('bootstrapjs', function(){
    return gulp.src(paths.js.bootstrap)
        .pipe(concat('bootstrap.js'))
        .pipe(replace(/^(export|import).*/gm, ''))
        .pipe(babel({
          presets: [
            [
              '@babel/env',
              {
                loose: true,
                modules: false,
                exclude: ['transform-typeof-symbol']
              }
            ]
          ],
          plugins: [
            '@babel/proposal-object-rest-spread'
          ],
          env: {
            test: {
              plugins: [ 'istanbul' ]
            }
          }
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(reload({ stream:true }));
});

gulp.task('mrarejs', function(){
    return gulp.src(paths.js.mrare)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(concat('theme.js'))
        .pipe(replace(/^(export|import).*/gm, ''))
        .pipe(babel({
          presets: [
            [
              '@babel/env',
              {
                loose: true,
                modules: false,
                exclude: ['transform-typeof-symbol']
              }
            ]
          ],
          plugins: [
            '@babel/proposal-object-rest-spread',
            'transform-strict-mode',
          ],
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest(paths.dist.js))
        .pipe(reload({ stream:true }));
});

// Assets
gulp.task('copy-assets', function(){
    return copyNewer(paths.assets.all, paths.dist.assets);
});

gulp.task('deps', function(done){
    paths.copyDependencies.forEach(function(files){
        gulp.src(`${files.from}/${files.files}`)
            .pipe(newer(files.to))
            .pipe(gulp.dest(files.to));
    });
    done();
});

// watch files for changes and reload
gulp.task('serve', function() {
  return browserSync({
    server: {
      baseDir: './dist',
      index: "index.html"
    }
  });
});

gulp.task('watch', function() {
  
  // PAGES
  // Watch only .html pages as they can be recompiled individually
  gulp.watch([paths.pages.html], {cwd: './'}, gulp.parallel('html'));

  // SCSS
  // Any .scss file change will trigger a sass rebuild
  gulp.watch([paths.scss.all], {cwd: './'}, gulp.parallel('sass'));

  // JS
  // Rebuild bootstrap js if files change
  gulp.watch([paths.js.bootstrap], {cwd: './'}, gulp.parallel('bootstrapjs'));

  // Rebuild mrare js if files change
  gulp.watch([paths.js.mrare], {cwd: './'}, gulp.parallel('mrarejs'));
 
  // Rebuild mrare js if files change
  const assetsWatcher = gulp.watch([paths.assets.all, paths.assets.allFolders], {cwd: './'}, gulp.parallel('copy-assets'));
  
  assetsWatcher.on('change', function (event) {
    
    const changedDistFile = path.resolve(paths.dist.assets, path.relative(path.resolve(paths.assets.folder), event.path));
    log(`${ event.type } ${ path.basename(changedDistFile) }`);

    if (event.type === 'deleted') {
      del.sync(changedDistFile);
    }
  });

  return assetsWatcher;

});

gulp.task('default', gulp.series('clean:dist', 'copy-assets', gulp.parallel('html', 'sass-min', 'bootstrapjs', 'mrarejs'), gulp.parallel('serve' ,'watch'), function(done){
  done();
}));

function copyNewer(from, to){
  return gulp.src(from)
        .pipe(newer(to))
        .pipe(gulp.dest(to))
        .on('end', reload);
}
