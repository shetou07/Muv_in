const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all DFX API calls
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:4943',
      changeOrigin: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({ error: 'DFX network not accessible' });
      }
    })
  );

  // Proxy canister calls
  app.use(
    '/_/',
    createProxyMiddleware({
      target: 'http://127.0.0.1:4943',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );

  // Proxy direct canister ID calls
  app.use(
    (pathname) => pathname.match(/^\/[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z0-9]+-[a-z]+$/),
    createProxyMiddleware({
      target: 'http://127.0.0.1:4943',
      changeOrigin: true,
      logLevel: 'debug'
    })
  );
};
