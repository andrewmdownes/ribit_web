import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62',
  },
  
  // Header styles (matching other screens)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#5DBE62',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Roboto',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 36,
  },

  // ADDED: Content wrapper for grey background
  content: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
      justifyContent: 'flex-start',
    }),
  },

  // Main content
  scrollContainer: {
    padding: 15,
    ...(Platform.OS === 'web' && {
      maxWidth: 600,
      alignSelf: 'center',
      width: '100%',
    }),
  },

  // Development test button
  testButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },

  // Card styles (matching other screens)
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  termsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },

  // Route display (matching RideDetailScreen)
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  routeIconsContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5DBE62',
  },
  routeLine: {
    width: 2,
    height: 25,
    backgroundColor: '#5DBE62',
    marginVertical: 4,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff6b6b',
  },
  routeDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
    marginBottom: 18,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 15,
  },

  // Ride details
  rideDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rideDetail: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },

  // Price display
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5DBE62',
    fontFamily: 'Roboto',
  },

  // Section labels
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },

  // Card input styles - Updated for better web compatibility
  cardContainer: {
    height: Platform.OS === 'web' ? 50 : 50,
    marginBottom: 10,
    ...(Platform.OS === 'web' && {
      // Web-specific styling is handled in the CardField component
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#e1e1e1',
      backgroundColor: '#f5f5f5',
    }),
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    fontSize: 16,
    fontFamily: 'Roboto',
    ...(Platform.OS === 'web' && {
      // Additional web styling if needed
      outline: 'none',
    }),
  },

  // Terms and conditions
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e1e1e1',
    backgroundColor: '#fff',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  checkboxChecked: {
    backgroundColor: '#5DBE62',
    borderColor: '#5DBE62',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  termsLink: {
    color: '#5DBE62',
    fontWeight: '500',
  },

  // Pay button
  payButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'backgroundColor 0.2s ease',
    }),
  },
  payButtonDisabled: {
    backgroundColor: '#c7e6c3',
    opacity: 0.6,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  
  // Savings display
  savingsValue: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    fontFamily: 'Roboto',
  },

  // Legacy web message styles (keeping for backward compatibility but not used)
  webMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMessageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Roboto',
  },
  webMessageText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    fontFamily: 'Roboto',
    lineHeight: 24,
  },
  returnButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
});

export default styles;