// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: [
        // Add packages that need to be transpiled
        '@stripe/stripe-react-native',
        'react-native-maps',
        'expo-location',
        'react-native-wheel-picker-expo',
        '@react-native-picker/picker',
        'react-native-calendars',
      ],
    },
  }, argv);

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": false,
    "stream": false,
    "assert": false,
    "http": false,
    "https": false,
    "os": false,
    "url": false,
    "zlib": false,
    "util": false,
    "buffer": false,
    "process": false,
  };

  // Add platform extensions resolution
  config.resolve.extensions = [
    '.web.tsx',
    '.web.ts',
    '.web.jsx', 
    '.web.js',
    '.tsx',
    '.ts', 
    '.jsx',
    '.js',
    '.json'
  ];

  // Add alias for platform-specific files
  config.resolve.alias = {
    ...config.resolve.alias,
    './lib/stripeWrapper$': './lib/stripeWrapper.web.js',
    './components/MapComponent$': './components/MapComponent.web.js',
  };

  return config;
};