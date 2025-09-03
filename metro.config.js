// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add platform extensions for web
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Add platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Platform-specific file resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add alias for platform-specific files
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-maps': path.resolve(__dirname, 'components/MapComponent'),
};

// Web-specific resolver configuration
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.alias = {
    ...config.resolver.alias,
    './lib/stripeWrapper': path.resolve(__dirname, 'lib/stripeWrapper.web.js'),
    'react-native-maps': path.resolve(__dirname, 'components/MapComponent.web.js'),
  };
}

module.exports = config;