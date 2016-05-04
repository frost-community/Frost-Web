var gulp = require("gulp");
var stylus = require("gulp-stylus");
var autoprefixer = require("gulp-autoprefixer");

gulp.task("stylus", function() {
	gulp.src("src-assets/**/*.styl")
		.pipe(stylus())
		.pipe(autoprefixer())
		.pipe(gulp.dest("./assets"));
});

gulp.task("copy", function() {
	gulp.src(["src-assets/**/*.js", "src-assets/**/*.png"])
		.pipe(gulp.dest("./assets"));
});

gulp.task("watch", function() {
	gulp.watch("src-assets/**/*.styl", ['stylus']);
});

gulp.task("default", ["stylus", "copy"]);