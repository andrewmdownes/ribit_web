import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const verifyStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    fontFamily: 'Roboto',
    lineHeight: 26,
  },
  emailText: {
    fontWeight: '600',
    color: '#333',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
codeInput: {
  width: 48,
  height: 55,
  borderWidth: 1,
  borderColor: '#e1e1e1',
  borderRadius: 8,
  backgroundColor: '#f6f6f6',
  justifyContent: 'center',  // center vertically
  alignItems: 'center',      // center horizontally
  marginHorizontal: 4,       // spacing between boxes (optional)
},
codeInputText: {
  fontSize: 24,              // slightly bigger for visibility
  fontWeight: '600',
  fontFamily: 'Roboto',
  color: '#333',
  textAlign: 'center',
  lineHeight: 55,            // match height for vertical centering on iOS
},
emptyCodeInput: {
  backgroundColor: '#fafafa', // slightly different bg for empty boxes (optional)
},
activeCodeInput: {
  borderColor: '#5DBE62',  // bright green or your brand color
  borderWidth: 2,
  shadowColor: '#5DBE62',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 5,
  elevation: 5, // Android shadow
},
pasteCodeText: {
  color: '#4a90e2',
  fontSize: 14,
  textDecorationLine: 'underline',
  textAlign: 'center',
  marginBottom: 20,
  fontFamily: 'Roboto',
},
  button: {
    backgroundColor: '#5DBE62',
    paddingVertical: 18,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#c7e6c3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  resendText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Roboto',
  },
  resendLink: {
    fontSize: 16,
    color: '#5DBE62',
    fontWeight: '600',
    fontFamily: 'Roboto',
  },
  timerText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Roboto',
  },
  changeEmailButton: {
    padding: 10,
  },
  changeEmailText: {
    fontSize: 16,
    color: '#333',
    textDecorationLine: 'underline',
    fontFamily: 'Roboto',
  },
});

export default verifyStyles;
