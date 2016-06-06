import * as path from 'path';

const JAVASCRIPT = /\.js\.gz$/;

/**
 * Set headers for compressed files.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The function to call to continue processing.
 * @returns {void}
 */
export default function handleZipFile(req, res, next) {
  const filename = path.basename(req.path);
  if (JAVASCRIPT.test(filename)) {
    res.set({
      'Content-Encoding': 'gzip',
      'Content-Type': 'application/javascript'
    });
  }
  if (next) {
    next();
  }
}
