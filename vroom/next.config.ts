// This file is used to configure the Next.js app. It is used to enable PWA support in the app.
const runtimeCaching = require("next-pwa/cache");
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  runtimeCaching,
});

module.exports = withPWA({
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
});