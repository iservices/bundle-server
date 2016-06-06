import * as assert from 'assert';
import * as http from 'http';
import serverStart from '../../../index';

/**
 * Tests for the server code.
 */
describe('/src/local/server', function () {
  /**
   * Check that the server works with existng paths.
   */
  it('should generate valid output for a valid request.', function (done) {
    const server = serverStart(0, {
      distPath: __dirname + '/../../../src/tests/fixtures/local/system/dist/',
      libPath: __dirname + '/../../../src/tests/fixtures/local/system/lib/',
      version: '1.0.0',
      port: 3000,
      silent: true
    });

    http.get({ port: 3000, path: '/example/' }, function (resp) {
      assert.equal(resp.statusCode, 200, 'Status code is not correct.');
      let body = '';
      resp.on('data', function (data) { body += data; });
      resp.on('end', function () {
        assert.ok(body.indexOf('<script src="/dist/packages/bundle-1.0.0.min.js.gz"') !== -1, 'package script tag is missing from body of response.');
        assert.ok(body.indexOf('<script src="/dist/1.0.0/apps/example/bundle.min.js.gz"') !== -1, 'app script tag is missing from body of response.');
        server.close();
        done();
      });
    });
  });

  /**
   * Check that the server returns 404 for apps that don't exist.
   */
  it('should respond with 404 when a request for a non-existent app is made.', function (done) {
    const server = serverStart(0, {
      distPath: __dirname + '/../../../src/tests/fixtures/local/system/dist/',
      libPath: __dirname + '/../../../src/tests/fixtures/local/system/lib/',
      version: '1.0.0',
      port: 3001,
      silent: true
    });

    http.get({ port: 3001, path: '/missingapp/' }, function (resp) {
      assert.equal(resp.statusCode, 404, 'Status code is not correct.');
      server.close();
      done();
    });
  });
});
