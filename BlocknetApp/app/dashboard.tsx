import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Welcome to BlockNet</Text>
      <Text style={styles.subtitle}>Your secure file verification hub</Text>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Upload & Verify File</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Verification History</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Files */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Files</Text>
        <Text style={styles.fileItem}>document1.pdf – ✅ Verified</Text>
        <Text style={styles.fileItem}>image.png – ❌ Not Found</Text>
        <Text style={styles.fileItem}>report.docx – ✅ Verified</Text>
      </View>

      {/* Verification Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Last Verification</Text>
        <Text style={styles.status}>Hash: 0xA12B34C56D...</Text>
        <Text style={styles.status}>Timestamp: 27 Nov 2025, 11:30 PM</Text>
        <Text style={styles.status}>Result: ✅ File is authentic</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.accountInfo}>User: Muhammad</Text>
        <Text style={styles.accountInfo}>Email: user@example.com</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38bdf8',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#38bdf8',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#38bdf8',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fileItem: {
    color: '#e2e8f0',
    marginBottom: 6,
  },
  status: {
    color: '#22c55e',
    marginBottom: 6,
  },
  accountInfo: {
    color: '#cbd5e1',
    marginBottom: 6,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
