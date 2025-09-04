// lib/navigationHelper.js - Create this new file
export const navigateToMyRides = (navigation, tabType = 'booked') => {
  console.log(`🏠 Navigating to My Rides - ${tabType} tab...`);
  
  try {
    // Method 1: Direct navigation
    navigation.navigate('MainTabs', {
      screen: 'My Rides',
      params: { 
        initialTab: tabType, // 'booked' or 'posted'
        refresh: true,
        timestamp: Date.now() // Force refresh
      }
    });
    console.log(`✅ Navigation successful to ${tabType} rides (Method 1)`);
  } catch (error) {
    console.log('⚠️ Direct navigation failed, trying reset...', error);
    
    try {
      // Method 2: Reset navigation
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'MainTabs',
            params: {
              screen: 'My Rides',
              params: { 
                initialTab: tabType,
                refresh: true,
                timestamp: Date.now()
              }
            }
          }
        ],
      });
      console.log(`✅ Reset navigation successful to ${tabType} rides (Method 2)`);
    } catch (resetError) {
      console.log('⚠️ Reset failed, using fallback...', resetError);
      
      // Method 3: Basic fallback
      navigation.navigate('MainTabs');
      setTimeout(() => {
        navigation.navigate('My Rides', { 
          initialTab: tabType, 
          refresh: true 
        });
      }, 500);
      console.log(`✅ Fallback navigation to ${tabType} rides (Method 3)`);
    }
  }
};

// Navigation helper for booking success (passenger books a ride)
export const navigateToBookedRides = (navigation) => {
  return navigateToMyRides(navigation, 'booked');
};

// Navigation helper for ride posting success (driver offers a ride)
export const navigateToPostedRides = (navigation) => {
  return navigateToMyRides(navigation, 'posted');
};

// Usage examples:
// For booking success: navigateToBookedRides(navigation);
// For ride posting success: navigateToPostedRides(navigation);
// For general use: navigateToMyRides(navigation, 'booked') or navigateToMyRides(navigation, 'posted');