import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62', // Changed from '#f5f5f5' to green like other screens
  },
  
  // New content wrapper for grey background (following pattern from other screens)
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  scrollContainer: {
    paddingBottom: 30,
  },
luggageContainer: {
  marginTop: 4,
},

luggageText: {
  fontSize: 13,
  color: '#555',
  // Optional: make it a bit lighter to differentiate from rating/seats
  fontStyle: 'italic',
},


  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Changed from 15 to 20 to match other screens
    paddingVertical: 15,
    backgroundColor: '#5DBE62', // Explicitly set to match other screens
  },
  backButton: {
    padding: 8, // Changed from 10 to 8 to match other screens
    borderRadius: 20, // Changed from 24 to 20 to match other screens
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 36, // Changed from 44 to 36 to match other screens
    height: 36, // Changed from 44 to 36 to match other screens
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 18, // Changed from 22 to 18 to match other screens
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18, // Changed from 22 to 18 to match other screens
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Roboto',
  },
  placeholder: {
    width: 36, // Changed from 44 to 36 to match other screens
  },
  
  // Ride Information Card
  rideInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  routeSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },
  routeContainer: {
    flexDirection: 'row',
  },
  routeIconsContainer: {
    alignItems: 'center',
    marginRight: 18,
  },
  originDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#5DBE62',
  },
  routeLine: {
    width: 2,
    height: 55, // Increased height to accommodate address text
    backgroundColor: '#5DBE62',
    marginVertical: 4,
  },
  destinationDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff6b6b',
  },
  routeDetails: {
    flex: 1,
  },
  locationDetail: {
    marginBottom: 20, // Increased margin to accommodate address
  },
  locationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  meetingPoint: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto',
    marginBottom: 2,
  },
  // NEW: Style for pickup/dropoff addresses
  meetingPointAddress: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 16,
  },
  
  // Ride Details Section
  rideDetailsSection: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
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

  // NEW: Verification Notice Card
  verificationNoticeCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  verificationNoticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  verificationNoticeText: {
    fontSize: 16,
    color: '#856404',
    lineHeight: 22,
    fontFamily: 'Roboto',
    marginBottom: 15,
  },

  // NEW: PIN Verification Interface Styles
  pinVerificationContainer: {
    marginTop: 15,
  },
  pinInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  pinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pinInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginRight: 12,
  },
  pinInputError: {
    borderColor: '#dc3545',
  },
  verifyButton: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  verifyButtonText: {
    color: '#856404',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  pinErrorText: {
    color: '#dc3545',
    fontSize: 14,
    fontFamily: 'Roboto',
    marginTop: 5,
  },

  // NEW: Passenger PIN Display (for passengers)
  passengerPinDisplay: {
    marginTop: 15,
    alignItems: 'center',
  },
  passengerPinDisplayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  passengerPinDisplayContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ffc107',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginBottom: 10,
  },
  passengerPinDisplayCode: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#856404',
    textAlign: 'center',
    letterSpacing: 8,
  },
  passengerPinDisplayHint: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },

  // NEW: Verification Complete Message (for passengers)
  verificationCompleteContainer: {
    marginTop: 15,
    alignItems: 'center',
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  verificationCompleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },

  // NEW: Verification Success Card (shown when verified)
  verificationSuccessCard: {
    backgroundColor: '#d4edda',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  verificationSuccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  verificationSuccessText: {
    fontSize: 16,
    color: '#155724',
    lineHeight: 22,
    fontFamily: 'Roboto',
  },

  // NEW: Restricted Content (blurred when not verified)
  restrictedContent: {
    flex: 1,
  },
  restrictedContentBlurred: {
    opacity: 0.3,
    pointerEvents: 'none', // Disable interaction
  },

  // Participant Card
  participantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  passengerList: {
    // Container for multiple passengers
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Add margin between passengers
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#5DBE62',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#f8b500',
    marginRight: 8,
    fontFamily: 'Roboto',
  },
  ridesText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto',
  },
  contactButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5DBE62',
    backgroundColor: 'rgba(135, 215, 124, 0.1)',
  },
  contactButtonText: {
    color: '#5DBE62',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },

  // Action Buttons Card
  actionButtonsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  trackingButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  trackingButtonTextActive: {
    color: '#fff',
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5DBE62',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8, // Reduced margin since we have directions button below
  },
  shareButtonText: {
    color: '#5DBE62',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },

  // Map Container and styles
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },
  mapView: {
    height: 350, // Increased height for better route visibility with markers
    borderRadius: 12,
  },
  mapPlaceholder: {
    height: 350, // Match the mapView height
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#adb5bd',
    fontFamily: 'Roboto',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Status Card
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Roboto',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#5DBE62',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Roboto',
  },
  // Route info display styles
  routeInfoDisplay: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#5DBE62',
  },
  routeInfoText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto',
    fontWeight: '500',
  },

  // Enhanced share button styles
  shareButtonDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
  },
  shareButtonTextDisabled: {
    color: '#ccc',
  },

  // Enhanced directions button
  directionsButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  directionsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
    textAlign: 'center', // Ensure text is centered for longer button text
  },

  // NEW: Drop-off navigation button (for drivers, when verified)
  dropoffButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5DBE62',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  dropoffButtonText: {
    color: '#5DBE62',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
});

export default styles;