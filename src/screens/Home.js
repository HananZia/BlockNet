import { View, Text, Button, StyleSheet } from 'react-native';

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlockNet</Text>
      <Text style={styles.subtitle}>Blockchain-based File Verification System</Text>
      <View style={styles.buttons}>
        <Button title="Sign Up" onPress={() => navigation.navigate('SignUp')} />
        <Button title="Sign In" onPress={() => navigation.navigate('SignIn')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f0f0f0' },
  title: { fontSize:32, fontWeight:'bold', color:'#1e40af' },
  subtitle: { fontSize:16, marginVertical:10 },
  buttons: { flexDirection:'row', gap:10, marginTop:20 }
});
