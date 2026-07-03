import app from './server' 

// Export the app as a serverless function
module.exports = (req, res) => {
  return app(req, res);
};