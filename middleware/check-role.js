const jwt = require('jsonwebtoken');

module.exports = function (role) {
  return function (req, res, next) {
    // Allow preflight OPTIONS requests to proceed
    if (req.method === 'OPTIONS') {
      next();
    }

    try {
      const token = req.headers.authorization.split(' ')[1];

      // If no token is provided, respond with an unauthorized status
      if (!token) {
        return res.status(401).json({ "message": "No auth" });
      }

      const decoded = jwt.verify(token, process.env.JWT_KEY);

      // Check if the user's role matches the required role
      if (decoded.role !== role) {
        return res.status(401).json({ "message": "No permission" });
      }

      // Attach the decoded user information to the request object for further use
      req.user = decoded;

      next();
    } catch (err) {
      res.status(401).json({ "message": "No permission" });
    }
  }
}
