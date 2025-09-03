import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62',
  },
  // Updated header style to match MainScreen
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Changed from 'space-between' to 'center'
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#5DBE62',
  },
  // Updated logo style to match MainScreen font size
  logo: {
    fontSize: 28, // Changed from 24 to 28
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Roboto',
  },
  // ADDED: Content wrapper for grey background
  content: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  // Keeping these for reference but they won't be used anymore
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  toggleButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 14,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  profileButtonText: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#5DBE62',
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  ridesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    fontFamily: 'Roboto',
  },
  ridesList: {
    paddingBottom: 20,
  },
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  completedRideCard: {
    opacity: 0.7,
  },
  statusBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    zIndex: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'Roboto',
    fontWeight: '500',
  },
  // NEW: Completed status badge styles
  statusBadgeCompleted: {
    backgroundColor: '#d4edda',
    borderColor: '#5DBE62',
    borderWidth: 1,
  },
  statusBadgeTextCompleted: {
    color: '#155724',
    fontWeight: '600',
  },
  // NEW: Cancelled status badge styles
  statusBadgeCancelled: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  statusBadgeTextCancelled: {
    color: '#721c24',
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: 'normal',  // Changed from 'bold' to 'normal'
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
  cancelButton: {
    marginTop: 15,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  cancelButtonDisabled: {
    opacity: 0.6,
    borderColor: '#ccc',
    backgroundColor: 'rgba(200, 200, 200, 0.05)',
  },
  cancelButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  removeButton: {
    marginTop: 15,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  removeButtonDisabled: {
    opacity: 0.6,
    borderColor: '#ddd',
    backgroundColor: 'rgba(200, 200, 200, 0.05)',
  },
  removeButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  emptyState: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  postedRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeContainer: {
    flex: 1,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Roboto',
  },
  postedRideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'Roboto',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  
  // NEW: Pickup/Dropoff flexibility display styles
  flexibilityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  flexibilityLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto',
    fontWeight: '500',
  },
  flexibilityValue: {
    fontSize: 12,
    color: '#28a745',
    fontFamily: 'Roboto',
    fontWeight: '600',
    backgroundColor: '#e8f9f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  
  passengersSection: {
    marginBottom: 10,
  },
  passengersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passengerAvatarContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  passengerAvatarText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  passengerName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontFamily: 'Roboto',
  },
  passengerRating: {
    fontSize: 13,
    color: '#f8b500',
    fontFamily: 'Roboto',
  },
  rideCardWithBookings: {
    borderLeftWidth: 4,
    borderLeftColor: '#5DBE62',
    backgroundColor: '#f8fdf8',
  },
  bookingIndicator: {
    backgroundColor: '#5DBE62',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bookingIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  detailValueHighlight: {
    color: '#5DBE62',
    fontWeight: '600',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  passengerSeats: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Roboto',
    marginTop: 2,
  },
  noPassengersText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Roboto',
    textAlign: 'center',
    paddingVertical: 10,
  },
  // NEW: Cancelled text in passengers section
  cancelledText: {
    fontSize: 14,
    color: '#dc3545',
    fontStyle: 'italic',
    fontFamily: 'Roboto',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default styles;