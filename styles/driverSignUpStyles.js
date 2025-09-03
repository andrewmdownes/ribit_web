import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62',
  },
  // NEW: Content wrapper for grey background (following pattern from other screens)
  content: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContainer: {
    padding: 20,
  },
  paymentOptionsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},

paymentOptionBox: {
  flex: 1,
  padding: 15,
  marginHorizontal: 5,
  borderRadius: 10,
  borderWidth: 1.5,
  alignItems: 'center',
  transitionDuration: '0.2s',
},

paymentOptionSelected: {
  backgroundColor: '#007AFF',
  borderColor: '#007AFF',
},

paymentOptionUnselected: {
  backgroundColor: '#f2f2f2',
  borderColor: '#ccc',
  opacity: 0.6,
},

paymentOptionText: {
  fontSize: 16,
  fontWeight: '500',
  color: '#333',
},

paymentOptionTextSelected: {
  color: '#fff',
},

paymentFormWrapper: {
  marginTop: 15,
},

inputField: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 10,
  marginTop: 5,
  fontSize: 16,
  backgroundColor: '#fff',
},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
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
    marginRight: 12,
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
  inputContainer: {
    marginBottom: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'Roboto',
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
  uploadSection: {
    marginVertical: 10,
  },
  uploadButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  fileUploadedContainer: {
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: '#e8e8e8',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  changeButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Roboto',
  },
  requirementText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  submitButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginVertical: 15,
  },
  statusView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusPending: {
    backgroundColor: '#f8b500',
  },
  statusVerified: {
    backgroundColor: '#5DBE62',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Roboto',
  },
  statusPendingText: {
    color: '#f8b500',
  },
  statusVerifiedText: {
    color: '#5DBE62',
  },
  additionalText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Roboto',
    marginTop: 5,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: width * 0.85,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  modalButton: {
    backgroundColor: '#5DBE62',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Roboto',
  }
});

export default styles;