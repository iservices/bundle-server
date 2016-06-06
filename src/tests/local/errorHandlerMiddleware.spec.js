/* eslint-env node, mocha */
import * as assert from 'assert';
import errorHandler from '../../local/errorHandlerMiddleware';

/**
 * Tests for the server code.
 */
describe('/src/local/errorHandlerMiddleware', function () {
  /**
   * Check that the error handler returns a 500 status code.
   */
  it('should work correctly.', function () {
    // build a dummy response object
    const resp = {
      statusCode: 0,
      status: (code) => {
        resp.statusCode = code;
        return resp;
      },
      send: () => {
      }
    };

    // test out the error handler
    errorHandler(new Error('Expected test error.  Ignore.'), {}, resp);
    assert.equal(resp.statusCode, 500, 'Status code was not set correctly.');
  });
});
