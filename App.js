import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

export default function App() {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontWeight: 'bold' }}>SKRIPSI</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
