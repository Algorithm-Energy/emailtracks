// Production build config — used by build-release.bat
// Does NOT include the dev-only proxy block.
// Devs: continue using vite.config.js for "npm run dev".
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

module.exports = defineConfig({
  plugins: [react()],
  base: '/EmailTrackingApp/',
});
