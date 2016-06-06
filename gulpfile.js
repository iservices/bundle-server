 /* eslint strict:0, no-console:0 */
'use strict';

const gulp = require('gulp');
const fs = require('fs');
global.__package = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const transform = require('build-transform');

transform.registerTasks({
  glob: ['**/*.[tj]s', '!styles/**/*', '!public/**/*', '!tests/fixtures/local/system/**/*'],
  inputDir: 'src/',
  outputDir: 'lib/'
});

/*
 * Build the application.
 */
gulp.task('build', ['transform'], function () {
});

/*
 * Fast build the application (only bundle apps).
 */
gulp.task('build-fast', ['transform'], function () {
});

if (process.env.NODE_ENV !== 'production') {
  const lint = require('build-lint');
  const test = require('build-test');

  lint.registerTasks({
    glob: ['src/**/*.js', '!src/public/**/*', '!src/styles/**/*', '!src/tests/fixtures/**/*']
  });

  test.registerTasks({
    testGlob: ['lib/tests/**/*.spec.js'],
    codeGlob: ['lib/**/*.js', '!lib/tests/**/*.js', '!lib/**/package.js'],
    thresholds: {
      global: { lines: 75 }
    },
    outputDir: 'testResults/',
    tasksDependencies: ['transform']
  });

  /*
   * Test the application.
   */
  gulp.task('test', ['lint', 'test-with-coverage'], function () {
  });

  /*
   * Watch for changes to files.
   */
  gulp.task('watch', ['watch-lint', 'watch-transform'], function () {
    console.log('Watch is running.');
    console.log('Type ^C to stop the watch process.');
  });
}
