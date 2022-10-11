/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { fileURLToPath } from 'url';
import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import cleanCss from 'gulp-clean-css';
import changeFileContent from 'gulp-change-file-content';

const sass = gulpSass(dartSass);

// eslint-disable-next-line no-redeclare
const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const processSass = () => gulp
  .src([
    './src/index.scss',
    './src/components/**/*.scss',
  ])
  .pipe(changeFileContent((content) => `@import 'globals.scss';\n${content}`))
  .pipe(sass.sync({
    includePaths: [path.join(__dirname, 'src')],
  }).on('error', sass.logError))
  .pipe(concat('beey-publish.css'))
  .pipe(gulp.dest('./dist'));

export const minifyCss = () => gulp
  .src('./dist/beey-publish.css')
  .pipe(cleanCss())
  .pipe(rename('beey-publish.min.css'))
  .pipe(gulp.dest('./dist'));

export const buildStyles = gulp.series(processSass, minifyCss);

export const copyLocale = () => gulp
  .src('./src/I18n/locale/*.json')
  .pipe(gulp.dest('./dist/locale/'));

export default () => gulp.watch(
  './src/**/*.scss',
  { ignoreInitial: false },
  processSass,
);
