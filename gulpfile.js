const gulp = require('gulp');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');

// Tarea para minificar JavaScript
function jsTask() {
  return gulp.src('assets/js/**/*.js')
    .pipe(terser({
      toplevel: true
    }))
    .pipe(gulp.dest('dist/assets/js'));
}

// Tarea para minificar CSS
function cssTask() {
  return gulp.src('assets/css/**/*.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist/assets/css'));
}

// Tarea para minificar HTML
function htmlTask() {
  return gulp.src('*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      removeOptionalTags: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true
    }))
    .pipe(gulp.dest('dist'));
}

// Tarea para copiar las imágenes y SVG (incluyendo el favicon)
function copyTask() {
  return gulp.src('assets/img/**/*')
    .pipe(gulp.dest('dist/assets/img'));
}

// Tarea principal (ejecuta todo en paralelo)
const build = gulp.parallel(jsTask, cssTask, htmlTask, copyTask);

exports.js = jsTask;
exports.css = cssTask;
exports.html = htmlTask;
exports.copy = copyTask;
exports.build = build;
exports.default = build;
