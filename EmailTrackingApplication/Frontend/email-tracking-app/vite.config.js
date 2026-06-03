const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  base: '/EmailTrackingApp/',
  // ⚠️  DEV ONLY — remove this entire "server" block before running "npm run build" for production.
  // In production the frontend is served by the same Kestrel host as the API,
  // so the relative URL "/EmailTrackingApp/apiEmail/..." resolves correctly without a proxy.
  server: {
    proxy: {
      '/EmailTrackingApp/apiEmail': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/EmailTrackingApp/, ''),
      }
    }
  }
});
