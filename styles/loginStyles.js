// styles/logins Styles.js
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5DBE62',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    flexWrap: 'wrap',
    textAlign: 'center',
    maxWidth: '90%',
  },
  input: {
    textAlign: 'center',
    textAlignVertical: 'center',
    height: 40,
    width: '70%',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 4,
    fontSize: 20,
    fontFamily: 'Roboto',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 4,
  },
  buttonText: {
    fontSize: 13,
    color: 'black',
    fontWeight: '600',
    fontFamily: 'Roboto',
    textAlign: 'center',
  },
});

export default loginStyles; 
