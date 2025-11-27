import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function SignIn({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput placeholder="Email" style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry />
      <Button title="Login" onPress={() => navigation.navigate('Dashboard')} />
      <Text style={styles.link} onPress={() => navigation.navigate('SignUp')}>
        Don’t have an account? Sign Up
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
