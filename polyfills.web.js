// polyfills.web.js - Web-specific polyfills
import 'react-native-url-polyfill/auto';

// Global polyfills for web
if (typeof global === 'undefined') {
  global = globalThis;
}

// Mock Node.js globals for web
global.process = global.process || {
  env: {},
  version: '16.0.0',
  platform: 'browser',
  cwd: () => '/',
};

global.Buffer = global.Buffer || {
  from: (str) => str,
  isBuffer: () => false,
};

// Mock require function for dynamic imports
global.require = global.require || function(id) {
  throw new Error(`Module '${id}' not found in web environment`);
};

// AsyncStorage fallback for web
if (typeof window !== 'undefined' && !window.localStorage) {
  const mockStorage = {
    getItem: () => Promise.resolve(null),
    setItem: () => Promise.resolve(),
    removeItem: () => Promise.resolve(),
    multiGet: () => Promise.resolve([]),
    multiSet: () => Promise.resolve(),
    multiRemove: () => Promise.resolve(),
    getAllKeys: () => Promise.resolve([]),
  };
  
  global.AsyncStorage = mockStorage;
}

// Suppress specific warnings for web
console.warn = (...args) => {
  if (args[0] && args[0].includes && (
    args[0].includes('Remote debugger') ||
    args[0].includes('require cycles') ||
    args[0].includes('componentWillReceiveProps')
  )) {
    return;
  }
  console.log('[WARN]', ...args);
};

export {};