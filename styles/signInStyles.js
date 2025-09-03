
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const signInStyles = StyleSheet.create(
    {container: {
    flex: 1,
    backgroundColor: '#5DBE62',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 10,
  },
  appName: {
    fontSize: 36,
    fontFamily: 'Roboto',
    color: '#fff',
    fontWeight: '700',
  },
  formContainer: {
    width: width * 0.9,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  subtitle: {
    fontSize: 17,
    color: '#666',
    textAlign: 'center',
    marginBottom: 26,
    fontFamily: 'Roboto',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Roboto',
  },
  emailInput: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 16,
    paddingHorizontal: 15,
    fontSize: 18,
    fontFamily: 'Roboto',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    width: '100%',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 6,
    fontFamily: 'Roboto',
  },
  button: {
    backgroundColor: '#5DBE62',
    paddingVertical: 18,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginVertical: 12,
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
  signUpText: {
    fontSize: 16,
    color: '#333',
    marginVertical: 16,
    fontFamily: 'Roboto',
  },
  signUpLink: {
    color: '#5DBE62',
    fontWeight: '600',
  },
});
export default signInStyles;
