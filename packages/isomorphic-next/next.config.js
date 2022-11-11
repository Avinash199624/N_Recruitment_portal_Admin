const withPlugins = require('next-compose-plugins');
const withTM = require('next-transpile-modules')([
  '@iso/components',
  '@iso/assets',
  '@iso/config',
  '@iso/lib',
  '@iso/ui',
  '@iso/redux',
  '@iso/containers',
]);
const withOptimizedImages = require('next-optimized-images');
const withFonts = require('next-fonts');
const withCSS = require('@zeit/next-css');
const withSass = require('@zeit/next-sass');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const withDraftJs = require('draft-js');

// next.js custom configuration goes here
const nextConfig = {
  env: {
    BACKEND_URL: 'https://localhost:8080',
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: 'empty',
      };
    }

    return config;
  },
};

// fix: prevents error when .css files are required by node
// if (typeof require !== 'undefined') {
//   require.extensions['.css'] = file => {};
// }

module.exports = withPlugins(
  [
    withTM,
    withOptimizedImages,
    withFonts,
    withSass,
    withCSS,
    withDraftJs,
    [
      withBundleAnalyzer,
      {
        analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
        analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
        bundleAnalyzerConfig: {
          server: {
            analyzerMode: 'static',
            reportFilename: '../bundles/server.html',
          },
          browser: {
            analyzerMode: 'static',
            reportFilename: '../bundles/client.html',
          },
        },
      },
    ],
  ],
  nextConfig
);
