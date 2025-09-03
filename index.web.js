// index.web.js - Web-specific entry point
import './polyfills.web.js';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Set platform for web
if (Platform.OS === 'web') {
  // Add web-specific initialization
  console.log('Ribit web app starting...');
}

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);