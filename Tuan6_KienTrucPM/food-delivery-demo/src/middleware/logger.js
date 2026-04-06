// src/middleware/logger.js
const morgan = require('morgan');

// Custom token: response body size
morgan.token('body-size', (req, res) => {
  const len = res.getHeader('Content-Length');
  return len ? `${len}b` : '-';
});

module.exports = morgan(':method :url :status :response-time ms :body-size', {
  skip: (req) => req.url === '/health',
});
