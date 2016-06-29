import * as BundleManager from 'build-bundle';
import * as express from 'express';
import * as compression from 'compression';
import * as path from 'path';
import PageBuilderMiddleware from './pageBuilderMiddleware';
import errorHandlerMiddleware from './errorHandlerMiddleware';
import gzipMiddleware from './gzipMiddleware';

/**
 * Starts a server instance.
 *
 * @param {Number} [workerId] - The worker id for the server.
 * @param {Object} options - Options for the server.
 * @param {String} options.distPath - The full path for the distribution folder.
 * @param {String} options.libPath - The full path for the lib folder.
 * @param {Number} [options.port] - The port number the server will listen on. Default is the PORT environment value or 3000 if that isn't set.
 * @param {String} [options.version] - The version number of the app the server is serving up.
 * @param {String} [options.baseUrlPath] - The base url for the server.  Default is '/dist'.
 * @param {String|String[]} [options.styles] - The urls for style sheets that should be included in every page.
 * @param {String|String[]} [options.shims] - The urls for bundles that will be loaded before the app bundle but after any other bundle.
 * @param {Boolean} [options.silent] - When set to true the server will not print startup info out to the console.  Default is false.
 * @return {Object} The newly created and running server is returned.
 */
export default function serverStart(workerId, options = {}) {
  const inOpts = (typeof workerId === 'object') ? workerId : options;

  // configure options
  const opts = {};
  opts.distPath = path.normalize(inOpts.distPath);
  opts.libPath = path.normalize(inOpts.libPath);
  opts.port = inOpts.port || process.env.PORT || 3000;
  opts.version = inOpts.version || '';
  opts.baseUrlPath = inOpts.baseUrlPath || '/dist';
  opts.silent = inOpts.silent;
  opts.styles = (typeof inOpts.styles === 'string') ? [inOpts.styles] : inOpts.styles;
  opts.shims = (typeof inOpts.shims === 'string') ? [inOpts.shims] : inOpts.shims;

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
    bundleManager: new BundleManager({
      inputDir: opts.distPath,
      baseUrlPath: opts.baseUrlPath,
      version: opts.version
    }),
    baseUrl: opts.version ? `${opts.baseUrlPath}/${opts.version}/` : opts.baseUrlPath + '/',
    styles: opts.styles,
    shims: opts.shims
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
