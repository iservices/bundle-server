import * as bundle from 'build-bundle';
import * as express from 'express';
import * as compression from 'compression';
import PageBuilderMiddleware from './pageBuilderMiddleware';
import errorHandlerMiddleware from './errorHandlerMiddleware';
import gzipMiddleware from './gzipMiddleware';

/**
 * Starts a server instance.
 * @param {Number} [workerId] - The worker id for the server.
 * @param {Object} options - Options for the server.
 * @param {String} options.distPath - The full path for the distribution folder.
 * @param {String} options.libPath - The full path for the lib folder.
 * @param {Number} [options.port] - The port number the server will listen on. Default is the PORT environment value or 3000 if that isn't set.
 * @param {String} [options.version] - The version number of the app the server is serving up.
 * @param {String} [options.baseUrlPath] - The base url for the server.  Default is '/dist'.
 * @param {Boolean} [options.silent] - When set to true the server will not print startup info out to the console.  Default is false.
 * @returns {Object} The newly created and running server is returned.
 */
export default function serverStart(workerId, options = {}) {
  const inOpts = (typeof workerId === 'object') ? workerId : options;

  // configure options
  const opts = {};
  opts.distPath = inOpts.distPath;
  opts.libPath = inOpts.libPath;
  opts.port = inOpts.port || process.env.PORT || 3000;
  opts.version = inOpts.version || '';
  opts.baseUrlPath = inOpts.baseUrlPath || '/dist';
  opts.silent = inOpts.silent;

  // create express server
  const app = express();

  // compress responses
  app.use(compression());

  // handle request for pre-compressed resources
  app.use(gzipMiddleware);

  // static resources
  app.use(opts.baseUrlPath, express.static(opts.distPath, { maxAge: 31536000 /* 1 year cache in seconds */ }));

  // page builder middleware
  const pageBuild = new PageBuilderMiddleware({
    libPath: opts.libPath,
    bundleManager: bundle.createManager({
      inputDir: opts.distPath,
      baseUrlPath: opts.baseUrlPath,
      version: opts.version
    }),
    baseUrl: opts.version ? `${opts.baseUrlPath}/${opts.version}/` : opts.baseUrlPath + '/'
  });
  app.use(pageBuild.handleRequest.bind(pageBuild));

  // error handler
  app.use(errorHandlerMiddleware);

  // start app
  return app.listen(opts.port, function () {
    // log info when server starts
    if (!opts.silent) {
      const info = `SERVER STARTED: [NODE_ENV: ${process.env.NODE_ENV}, VERSION: ${opts.version}, WORKERID: ${workerId}, PORT: ${opts.port}]`;
      console.log(info); // eslint-disable-line no-console
    }
  });
}
