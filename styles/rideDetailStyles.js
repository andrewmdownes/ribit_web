import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const rideDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62', // Changed from '#f5f5f5' to green like other screens
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#5DBE62',
  },
  backButton: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luggageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // changed from 'center'
    marginTop: 4,
    paddingHorizontal: 0,
  },

  luggageColumnSmall: {
    alignItems: 'center',
    width: 60,
    marginHorizontal: 0,
    padding: 0,
  },

  luggageIconSmall: {
    fontSize: 22,
    marginVertical: 2,
  },

  counterCircleSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },

  counterTextSmall: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  arrowButtonSmall: {
    paddingVertical: 1,
  },

  arrowTextSmall: {
    fontSize: 14,
    fontWeight: '600',
  },

  luggageLabelSmall: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },

  luggageDescriptionSmall: {
    textAlign: 'center',
    fontSize: 9,
    color: '#666',
    paddingHorizontal: 0,
    marginTop: 1,
  },

  backButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Roboto',
  },
  placeholder: {
    width: 44,
  },
  // New content wrapper for grey background
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5DBE62',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
    fontFamily: 'Roboto',
  },
  verifiedBadge: {
    backgroundColor: '#5DBE62',
    borderRadius: 12,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    fontSize: 14,
    color: '#f8b500',
    marginRight: 6,
    fontFamily: 'Roboto',
  },
  ridesText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Roboto',
  },
  viewProfileButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5DBE62',
  },
  viewProfileText: {
    color: '#5DBE62',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  routeSection: {
    marginBottom: 12,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
  },
  durationText: {
    fontSize: 16,
    color: '#666',
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
    height: 55,
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
    marginBottom: 24,
  },
  locationName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  meetingPoint: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Roboto',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Roboto',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionItem: {
    flex: 1,
  },
  sectionItemLabel: {
    fontSize: 15,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'Roboto',
  },
  sectionItemValue: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  carSection: {
    marginBottom: 12,
  },
  carDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  carIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  carIcon: {
    fontSize: 22,
  },
  carInfo: {
    flex: 1,
  },
  carModel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  carYear: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Roboto',
  },
  preferencesSection: {
    marginTop: 10,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  preferenceItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  preferenceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  preferenceLabel: {
    fontSize: 15,
    color: '#444',
    fontFamily: 'Roboto',
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },
  seatSelection: {
    marginBottom: 22,
  },
  seatSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 18,
    fontFamily: 'Roboto',
  },
  seatButtons: {
    flexDirection: 'row',
  },
  seatButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f9f9f9',
  },
  selectedSeatButton: {
    backgroundColor: '#5DBE62',
    borderColor: '#5DBE62',
  },
  seatButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  selectedSeatButtonText: {
    color: '#fff',
  },
  priceSummary: {
    marginBottom: 22,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Roboto',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Roboto',
  },
  bookButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  // Savings display styles
  savingsLabel: {
    fontSize: 16,
    color: '#28a745',
    fontFamily: 'Roboto',
    fontStyle: 'italic',
  },
  savingsValue: {
    fontSize: 16,
    color: '#28a745',
    fontFamily: 'Roboto',
    fontWeight: '600',
  },
  arrowButtonLarge: {
    padding: 7, // was 10
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 4, // was 6
  },
  arrowTextLarge: {
    fontSize: 22, // was 28
    fontWeight: 'bold',
  },
  luggageInput: {
    width: 38, // was 48
    height: 38, // was 48
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 18, // was 24
    fontWeight: 'bold',
    backgroundColor: '#fff',
    marginHorizontal: 4, // was 6
  },
  luggageLabelLarge: {
    marginLeft: 10, // was 14
    fontSize: 15, // was 18
    fontWeight: '600',
    alignSelf: 'center',
  },
});

export default rideDetailStyles;