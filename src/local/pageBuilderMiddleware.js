import * as fto from 'file-tree-object';
import * as path from 'path';
import errorHandler from './errorHandlerMiddleware';
import PageBuilder from 'flux-angular2/lib/local/pageBuilder';

/**
 * Express middleware that creates pages from classes in the apps folder.
 */
class PageBuilderMiddleware {

  /**
   * @constructor
   * @param {Object} options - Options for this class.
   * @param {String} options.distPath - The lib path.
   * @param {BundleManager} options.bundleManager - Bundle manager used to generate script tags.
   * @param {String} options.baseUrlPath - The base url path for pages.
   */
  constructor(options = {}) {
    this.libPath = options.libPath;
    this.bundleManager = options.bundleManager;
    this.baseUrl = options.baseUrl;

    const funcs = {};
    const tree = fto.createTreeSync(this.libPath, { filePattern: /[\\\/]package.js$/, excludeEmptyDirectories: true });
    tree.forEachFile(function (file) {
      if (file.parent) {
        const item = require(file.path);
        funcs[path.join('/', file.parent.getPathFromRoot().toLowerCase(), '/')] = !item.default ?
          item.getPage :
          item.default.getPage;
      }
    }, { recurse: true });
    this.pageFuncs = funcs;
  }

  /**
   * Get the page function for the given path.
   * @param {String} filePath - The path for the given page.
   * @returns {Function} The function used to get a page or null if not found.
   */
  getPageFunction(filePath) {
    const getPage = this.pageFuncs[path.join('/', filePath.toLowerCase(), '/')];
    if (!getPage || typeof getPage !== 'function') {
      return null;
    }
    return getPage;
  }

  /**
   * Handles an express request message.
   * @param {Object} req - The request object.
   * @param {Object} res - The response object.
   * @param {Function} next - The function to call when done handling the request.
   * @returns {void}
   */
  handleRequest(req, res, next) {
    // get script tags
    const scriptTags = this.bundleManager.getScriptTags(req.path, 'zip');
    if (!scriptTags) {
      // if the given path isn't an application return a 404 response
      res.set('cache-control', 'private, max-age=0, no-cache');
      res.status(404).send('Not found: ' + req.path);
    } else {
      // generate the html that will be returned to the client
      const getPage = this.getPageFunction(req.path);
      const pb = new PageBuilder();
      pb.scripts = scriptTags;
      pb.baseUrl = this.baseUrl || '/';

      if (getPage) {
        getPage(req)
          .then(function (result) {
            res.set('cache-control', 'private, max-age=0, no-cache');
            res.send(pb.renderToString(result.view, result.props));
            if (next) {
              next();
            }
          })
          .catch(function (err) {
            errorHandler(err, req, res, next);
          });
      } else {
        res.send(pb.renderToString(null));
      }
    }
  }
}

export default PageBuilderMiddleware;
