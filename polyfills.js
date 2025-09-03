// polyfills.js
import { polyfillGlobal } from 'react-native-polyfill-globals';
import { TextEncoder, TextDecoder } from 'text-encoding';
import 'react-native-url-polyfill/auto';

// Polyfill TextEncoder/Decoder
if (typeof global.TextEncoder === 'undefined') {
  polyfillGlobal('TextEncoder', () => TextEncoder);
}
if (typeof global.TextDecoder === 'undefined') {
  polyfillGlobal('TextDecoder', () => TextDecoder);
}