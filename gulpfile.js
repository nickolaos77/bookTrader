'use strict'
const gulp   = require('gulp'),
      uglify = require('gulp-uglify')
//Scripts Task
//uglifies
// to run the following type 'gulp scripts'
gulp.task('scripts', function(){
    gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('minjs'))
})

//Styles Task
//uglifies
//to run it type 'gulp styles'
gulp.task('styles', function(){
    console.log('runs styles')
})

// to run the following type 'gulp' 
gulp.task('default',['scripts','styles'])