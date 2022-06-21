/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import changeFileContent from 'gulp-change-file-content';
import concat from 'gulp-concat';

const sass = gulpSass(dartSass);

// eslint-disable-next-line no-redeclare
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const buildStyles = () => gulp
  .src('./src/components/**/*.scss')
  .pipe(changeFileContent((content) => `@import 'globals.scss';\n${content}`))
  .pipe(sass.sync({
    includePaths: [path.join(__dirname, 'src')],
  }).on('error', sass.logError))
  .pipe(concat('style.css'))
  .pipe(gulp.dest('./dist'));

export default () => gulp.watch('./src/**/*.scss', buildStyles);
