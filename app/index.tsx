import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [verificationResult, setVerificationResult] = useState('');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      setFileName(file.name);
      setVerificationResult('');
    }
  };

  const verifyFile = () => {
    // TODO: Connect to backend for real hash verification
    setVerificationResult('✅ File verified successfully (mock result)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlockNet</Text>
      <Text style={styles.subtitle}>Verify your files instantly with blockchain</Text>

      <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
        <Text style={styles.uploadText}>
          {fileName ? `Selected: ${fileName}` : 'Tap to upload a file'}
        </Text>
      </TouchableOpacity>

      {fileName !== '' && (
        <TouchableOpacity style={styles.verifyButton} onPress={verifyFile}>
          <Text style={styles.verifyText}>Verify File</Text>
        </TouchableOpacity>
      )}

      {verificationResult !== '' && (
        <Text style={styles.result}>{verificationResult}</Text>
      )}

      <Text style={styles.link} onPress={() => router.push('./signup')}>
        Create an account to save your files and access your verification history
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b', // slate dark
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0ea5e9', // cyan-500
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#cbd5e1', // slate-300
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  uploadBox: {
    backgroundColor: '#334155', // slate-700
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    marginBottom: 20,
    width: '100%',
  },
  uploadText: {
    color: '#0ea5e9',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  result: {
    marginTop: 20,
    color: '#22c55e', // green-500
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  link: {
    marginTop: 40,
    color: '#3b82f6', // blue-500
    textDecorationLine: 'underline',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});
