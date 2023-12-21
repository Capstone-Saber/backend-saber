const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

const getToken = (headers) => {
  const authorizationHeader = headers.authorization;
  if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
    return (authorizationHeader.substring(7));
  }
  else {
    const error = new Error("You need to login");
    error.status = 403;
    throw error;
  }
}

const userVerification = async (req, res, next) => {
  try {
    const token = getToken(req.headers);
    const decoded = jwt.verify(token, jwtSecret);
    req.decoded = decoded;
    next();
  } catch (error) {
    res.status(error.status || 500).json({
      status: "Error",
      message: error.message
    })
  }
}

module.exports = userVerification;