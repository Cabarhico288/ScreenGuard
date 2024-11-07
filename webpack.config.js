const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add alias for react-native to resolve to react-native-web
  config.resolve.alias = {
    ...(config.resolve.alias || {}),
    'react-native$': 'react-native-web', // Alias react-native to react-native-web
  };

  // Ensure that Webpack resolves .web.tsx files before .tsx and .ts
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.tsx',
    '.ts',
    '.web.js',
    '.js',
    '.json',
  ];

  // Add fallback for crypto and other node core modules
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    // Add other fallbacks as needed
  };

  // Add Node polyfill plugin to handle node modules in the web environment
  config.plugins = [
    ...config.plugins,
    new NodePolyfillPlugin(),
  ];

  // Customize the devServer configuration
  if (config.devServer) {
    config.devServer = {
      ...config.devServer,
      onListening(server) {
        const port = server.server.address().port;
        console.log('Listening on port:', port);
      },
    };
  }

  return config;
};
