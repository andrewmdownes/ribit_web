// App.js with platform-specific imports and web fallbacks
import React from 'react';
import { Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Platform-specific Stripe import
let StripeProvider;
try {
  if (Platform.OS === 'web') {
    StripeProvider = require('./lib/stripeWrapper.web').StripeProvider;
  } else {
    StripeProvider = require('./lib/stripeWrapper.native').StripeProvider;
  }
} catch (error) {
  console.log('Stripe import error:', error);
  // Fallback for web
  StripeProvider = ({ children }) => children;
}

// Import screens
import SignUpScreen from './components/SignUpScreen';
import SignInScreen from './components/SignInScreen';
import VerifyScreen from './components/VerifyScreen';
import MainScreen from './components/MainScreen';
import RideDetailScreen from './components/RideDetailScreen';
import YourRideScreen from './components/YourRideScreen';
import DriverSignUpScreen from './components/DriverSignUpScreen';
import DriverVerificationStatusScreen from './components/DriverVerificationStatusScreen';
import MyRidesScreen from './components/MyRidesScreen';
import ProfileScreen from './components/ProfileScreen';
import ViewDriverProfileScreen from './components/ViewDriverProfileScreen';
import StripeApp from './components/StripeApp';
import ReviewScreen from './components/ReviewScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator (shown after login)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My Rides') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#5DBE62',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} />
      <Tab.Screen name="My Rides" component={MyRidesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSerif: require('./assets/fonts/NotoSerif-Regular.ttf'),
  });

  if (!fontsLoaded) return null;

  const stripePublishableKey = "pk_test_51RFSvZBzodOqsZP1NrhYlQsriGXAuf4A6YZwPwJ4ouFQyceljKBp5WGZhX8V3kTHTlww8mtHFH2JlqbuNwGGCDBw004h4gAnHX";

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="SignUp"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        >
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="VerifyScreen" component={VerifyScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ReviewScreen" component={ReviewScreen}/>
          <Stack.Screen name="RideDetail" component={RideDetailScreen} />
          <Stack.Screen name="YourRide" component={YourRideScreen} />
          <Stack.Screen name="DriverSignUp" component={DriverSignUpScreen} />
          <Stack.Screen name="VerificationStatus" component={DriverVerificationStatusScreen} />
          <Stack.Screen name="ViewDriverProfile" component={ViewDriverProfileScreen} />
          <Stack.Screen name="StripeApp" component={StripeApp} />
        </Stack.Navigator>
        <StatusBar style="light" backgroundColor="#5DBE62" />
      </NavigationContainer>
    </StripeProvider>
  );
}