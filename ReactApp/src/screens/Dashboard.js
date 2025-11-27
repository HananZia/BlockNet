import { View, Text, Button, StyleSheet } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BlockNet</Text>
      <Text style={styles.subtitle}>Upload and verify your files securely.</Text>
      <Button title="Logout" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', alignItems:'center' },
  title:{ fontSize:28, fontWeight:'bold', marginBottom:10 },
  subtitle:{ fontSize:16, marginBottom:20 }
});
