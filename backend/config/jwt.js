module.exports = {
  secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  
  // JWT options
  options: {
    issuer: 'legal-intelligence-system',
    audience: 'legal-intelligence-users'
  }
};
