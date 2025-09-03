## Starting

Follow these steps to install dependencies and launch the Expo app:

```bash
# Install Expo and project dependencies
npm install expo
npm install
npm install expo-image-picker@latest
npm install @supabase/supabase-js react-native-url-polyfill
npm install react-native-url-polyfill @react-native-async-storage/async-storage
npm install react-native-dotenv
npm install @react-native-async-storage/async-storage
npm install @react-navigation/bottom-tabs
npm install @expo/vector-icons

npm install cors
npm install stripe
npx expo install @stripe/stripe-react-native
npm install -g nodemon
npm install moment

npx expo install expo-document-picker
npm expo-image-manipulator
# Start the Expo development server
npx expo start
npx expo start --clear  # If the first one doesn't work

Download Expo Go on appstore and scan the QR code.

For debugging driver verification of info submitted, use window.verifyDriver() after clicking JS debugger when running the app on expo
