// components/AuthCheck.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { authApi } from '../lib/api';

export default function AuthCheck({ navigation, children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const { session } = await authApi.getSession();
      
      if (!session) {
        console.log('No session found, redirecting to SignUp');
        navigation.replace('SignUp');
        return;
      }
      
      console.log('User is authenticated with ID:', session.user.id);
      setAuthenticated(true);
    } catch (error) {
      console.error('Auth check error:', error);
      navigation.replace('SignUp');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#87d77c" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return authenticated ? children : null;
}