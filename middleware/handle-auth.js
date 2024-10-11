const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Allow preflight OPTIONS requests to proceed without authentication
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    // If no token is provided, respond with an unauthorized status
    if (!token) {
      return res.status(401).json({ "message": "No auth" });
    }

     // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Attach the decoded user information to the request object for further use
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ "message": "No auth" });
  }
}