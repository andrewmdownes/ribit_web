// services/profileService.js
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';

// Create or update profile
export const upsertProfile = async (profileData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const updates = {
      ...profileData,
      user_id: session.user.id,
      email: session.user.email,
      updated_at: new Date()
    };
    
    // Only create/update if user is logged in
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updates)
      .select();
      
    if (error) throw error;
    
    return { success: true, data: data[0] };
  } catch (error) {
    Alert.alert('Error updating profile', error.message);
    return { success: false, error: error.message };
  }
};

// Check if profile has required fields
export const isProfileComplete = (profile) => {
  return !!(
    profile &&
    profile.first_name &&
    profile.last_name &&
    profile.dob
  );
};

// Submit driver verification request
export const submitDriverVerification = async (licenseUrl, insuranceUrl) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    // Update profile to pending verification
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        is_driver: true,
        verification_pending: true 
      })
      .eq('user_id', session.user.id);
      
    if (profileError) throw profileError;
    
    // Add verification document record
    const { data, error } = await supabase
      .from('driver_verifications')
      .insert({
        driver_id: session.user.id,
        license_url: licenseUrl,
        insurance_url: insuranceUrl,
        status: 'pending'
      })
      .select();
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    Alert.alert('Error submitting verification', error.message);
    return { success: false, error: error.message };
  }
};

// Get driver verification status
export const getDriverVerificationStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('driver_verifications')
      .select('*')
      .eq('driver_id', session.user.id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned" which is fine
    
    return { success: true, data };
  } catch (error) {
    console.log('Error fetching verification status:', error.message);
    return { success: false, error: error.message };
  }
};