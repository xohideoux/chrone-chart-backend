const ApiError = require('../handlers/api-error');

module.exports = function (err, req, res, next) {
   // Check if the error is an instance of ApiError
  if (err instanceof ApiError) {
    // Respond with the specific error status and message
    return res.status(err.status).json({ message: err.message });
  }

  // For any other errors, respond with a generic server error status and message
  return res.status(500).json({ message: 'Unexpected error!' });
}