var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var runSequence = require("run-sequence");
var server = require("browser-sync").create();

gulp.task("style", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
        autoprefixer()
    ]))

    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))

    .pipe(server.stream());
});

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png, jpg, svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpgtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 80}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () { 
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
      // <div style="display:none">
      //  <include src="build/img/sprite.svg"></include>
      //  </div> 
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
   return gulp.src([
     "source/fonts/**/*.{woff,woff2,ttf}",
     "source/img/**",
     "source/js/**"
     ], {
     base: "source"
     })
     .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build/**");
});

gulp.task("serve", function() {
  server.init({
    server: "build/"
    // notify: false,
    // open: true,
    // cors: true,
    // ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("style"));
  gulp.watch("source/*.html", gulp.series("html"));
  gulp.watch("source/*.html").on("change", server.reload);
  gulp.watch("build/*.html").on("change", server.reload);
  gulp.watch("build/css/*.css").on("change", server.reload);
});


gulp.task("build", gulp.series("clean", "copy", "style", "sprite", "html"));

