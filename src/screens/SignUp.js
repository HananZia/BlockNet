import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function SignUp({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput placeholder="Name" style={styles.input} />
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry />
      <TextInput placeholder="Confirm Password" style={styles.input} secureTextEntry />
      <Button title="Sign Up" onPress={() => navigation.navigate('Dashboard')} />
      <Text style={styles.link} onPress={() => navigation.navigate('SignIn')}>
        Already have an account? Sign In
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', padding:20 },
  title:{ fontSize:24, fontWeight:'bold', marginBottom:20 },
  input:{ borderWidth:1, borderColor:'#ccc', padding:10, marginBottom:10, borderRadius:5 },
  link:{ marginTop:10, color:'blue', textAlign:'center' }
});
