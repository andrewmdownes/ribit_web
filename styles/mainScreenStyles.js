// styles/mainScreenStyles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#5DBE62',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Roboto',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#5DBE62',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
   modalOverlay: {
    flex: 1,
    justifyContent: 'center', // ⬅️ Center the modal
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    width: '75%',
    elevation: 5
  },
  pickerRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 0, // optional, remove any spacing
},

pickerColumnWrapper: {
  width: 60,           // tightly control width
  marginHorizontal: 5, // spacing between columns
  overflow: 'hidden',  // avoids visual bleeding
  backgroundColor: '#fff', // match modal background
  borderRadius: 6,
  alignItems: 'center',
},

selected: {
  borderColor: '#5DBE62',
  borderWidth: 1.5,
  borderRadius: 6,
},
  doneButton: {
    marginTop: 16,
    backgroundColor: '#5DBE62',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'Roboto',
  },
  activeTabText: {
    color: '#5DBE62',
  },
  content: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  
  searchContainer: {
    padding: 15,
    paddingBottom: 15, // Increased from 0
    backgroundColor: '#fff',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  inputHelpText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    fontFamily: 'Roboto',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  timeErrorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginBottom: 5,
    fontFamily: 'Roboto',
    textAlign: 'left',
  },
  citySelectContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cityButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#fff',
    marginHorizontal: 4,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityButtonSelected: {
    backgroundColor: '#5DBE62',
    borderColor: '#5DBE62',
  },
  cityButtonDisabled: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    opacity: 0.6,
  },
  cityButtonText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  cityButtonTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  cityButtonTextDisabled: {
    color: '#999',
  },
  locationSelectContainer: {
    marginBottom: 5,
  },
  locationButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationButtonSelected: {
    backgroundColor: '#5DBE62',
    borderColor: '#5DBE62',
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
    marginBottom: 4,
  },
  locationButtonTextSelected: {
    color: '#fff',
  },
  locationAddressText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto',
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto',
  },
  noLocationsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
    fontFamily: 'Roboto',
  },
  // Updated search button row to accommodate clear button
  searchButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  // New clear button styles
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  // Updated results title style
  resultsTitle: {
    fontSize: 18, // Increased from 16
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    fontFamily: 'Roboto',
  },
  ridesList: {
    paddingBottom: 20,
  },
  // Updated ride card style
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, // Slightly increased
    shadowRadius: 5,
    elevation: 3, // Increased from 2
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5DBE62',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#f8b500',
    marginRight: 5,
    fontFamily: 'Roboto',
  },
  ridesText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginVertical: 10,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5DBE62',
    marginTop: 5,
  },
  locationLine: {
    width: 1,
    height: 25,
    backgroundColor: '#5DBE62',
    marginLeft: 4.5,
    marginVertical: 2,
  },
  locationPin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6b6b',
    marginTop: 0,
  },
  locationTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  fromLocationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  toLocationText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  seatsContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  seatsText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Roboto',
  },
  
  // NEW: Extra miles styling - positioned below route details with clearer messaging
  extraMilesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  extraMilesLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto',
    fontWeight: '500',
  },
  extraMilesBadge: {
    backgroundColor: '#e8f9f0',
    borderColor: '#28a745',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  extraMilesText: {
    fontSize: 11,
    color: '#155724',
    fontFamily: 'Roboto',
    fontWeight: '600',
  },
  
  offerContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  offerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 25,
    fontFamily: 'Roboto',
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  postButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  
  // New styles for collapsed header
  collapsedHeaderContainer: {
    position: 'absolute',
    top: 15, 
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#5DBE62',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginHorizontal: 15,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  
  collapsedHeaderText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  
  collapsedHeaderArrow: {
    marginHorizontal: 8,
    fontSize: 16,
    color: '#fff',
  },
  
  collapsedSearchText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
// Add these styles to the end of mainScreenStyles.js (before the closing bracket)

  // Input error style
  inputError: {
    borderColor: '#ff3b30',
    backgroundColor: '#fff5f5',
  },

  // Price container and subtext styles
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceSubtext: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Roboto',
    marginTop: 2,
  },
  driverPriceText: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'Roboto',
    marginTop: 1,
    fontStyle: 'italic',
  },

  // Pricing-related styles
  routeInfoContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#5DBE62',
  },
  routeInfoText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto',
    marginBottom: 4,
  },
  maxPriceText: {
    fontSize: 14,
    color: '#5DBE62',
    fontFamily: 'Roboto',
    fontWeight: '600',
  },
  priceErrorText: {
    fontSize: 12,
    color: '#ff3b30',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  priceHelpText: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 4,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
  },
  
  // Driver pricing breakdown styles
  pricingBreakdownContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pricingBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  pricingBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  pricingBreakdownLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Roboto',
  },
  pricingBreakdownValue: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Roboto',
    fontWeight: '500',
  },
  pricingBreakdownNote: {
    fontSize: 11,
    color: '#6c757d',
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default styles;