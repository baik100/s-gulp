'use strict';
// yarn add autoprefixer browser-sync child_process cssnano del gulp-eslint gulp gulp-imagemin gulp-newer gulp-plumber gulp-postcss gulp-rename gulp-sass

// Load plugins
const autoprefixer = require("autoprefixer");
const browserSync = require("browser-sync").create();
const cp = require("child_process");
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");


const paths = {
    src : {
        html: "./src/**/*.html",
        scss: "./src/scss/*.scss",
        images: "./src/images/**/*",
        js: "./src/js/**/*.js",
    },

    dest : {
        html: "./dist/",
        css: "./dist/css",
        images: "./dist/images/",
        js: "./dist/js",
    }
};


// Clean assets
function clean() {
    return del([paths.dest.css, paths.dest.js]);
}

// Optimize Images
function images() {
    return gulp
        .src(paths.src.images)
        .pipe(newer(paths.dest.images))
        .pipe(
            imagemin([
                imagemin.gifsicle({ interlaced: true }),
                imagemin.jpegtran({ progressive: true }),
                imagemin.optipng({ optimizationLevel: 5 }),
                imagemin.svgo({
                    plugins: [
                        {
                            removeViewBox: false,
                            collapseGroups: true
                        }
                    ]
                })
            ])
        )
        .pipe(gulp.dest(paths.dest.images));
}

// CSS task
function css() {
    return gulp
        .src(paths.src.scss)
        .pipe(plumber())
        .pipe(sass({ outputStyle: "expanded" }))
        .pipe(gulp.dest('./src/css/'))
        .pipe(gulp.dest(paths.dest.css))
        .pipe(rename({ suffix: ".min" }))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(gulp.dest(paths.dest.css))
        .pipe(browserSync.stream());
}

// html task
function html() {
    return gulp
        .src(paths.src.html)
        .pipe(gulp.dest(paths.dest.html))
        .pipe(browserSync.stream());
}



// Transpile, concatenate and minify scripts
function scripts() {
    return (
        gulp
            .src([paths.src.js])
            .pipe(plumber())
            // folder only, filename is specified in webpack config
            .pipe(gulp.dest(paths.dest.js))
            .pipe(browserSync.stream())
    );
}

function watch() {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
    gulp.watch(paths.src.scss, css);
    gulp.watch(paths.src.html).on('change', browserSync.reload);
}

// define complex tasks
const js = gulp.series(scripts);
const build = gulp.series(clean, gulp.parallel(css, images, js, watch, html));

// export tasks
exports.images = images;
exports.css = css;
exports.js = js;
exports.html = html;
exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = build;


gulp.task('default', build);