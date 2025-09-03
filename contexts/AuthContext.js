
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState({
    isDriver: false,
    isVerified: false,
    verificationPending: false
  });

  useEffect(() => {
    // Check for existing session on app start
    checkUser();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) await fetchProfile(session.user);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Check current user and fetch their profile
  async function checkUser() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch user profile data
  async function fetchProfile(currentUser) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      if (error) throw error;

      if (data) {
        setProfile(data);
        setDriverStatus({
          isDriver: data.is_driver || false,
          isVerified: data.is_verified_driver || false,
          verificationPending: data.verification_pending || false
        });
      }
    } catch (error) {
      console.log('Error fetching profile:', error.message);
    }
  }

  // Sign up with email
  async function signUp(email) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        options: {
          emailRedirect: false // We'll handle verification with OTP
        }
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      Alert.alert('Sign up error', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  // Sign in with email
  async function signIn(email) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirect: false
        }
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      Alert.alert('Sign in error', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  // Verify OTP code
  async function verifyOtp(email, token) {
    try {
      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      Alert.alert('Verification error', error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  // Sign out
  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
    } catch (error) {
      Alert.alert('Sign out error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        driverStatus,
        loading,
        signIn,
        signUp,
        signOut,
        verifyOtp,
        refreshProfile: () => user && fetchProfile(user)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);