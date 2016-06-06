/* eslint no-console:0, no-unused-vars:0 */

/**
 * Error handler for internal errors.
 * @param {Error} err - The error that occured.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The function to call to continue processing.
 * @returns {void}
 */
export default function handleError(err, req, res, next) {
  console.error(err);
  res.status(500).send('Internal server error');
}
