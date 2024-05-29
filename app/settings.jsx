import React, { useEffect, useState, useRef } from 'react';
import { View, StatusBar, StyleSheet, FlatList } from 'react-native';
import { useTheme, TextInput, Text, IconButton, Button, Surface, Portal, Modal } from 'react-native-paper';

export default function Settings() {

  // For global theming
  const theme = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={styles.window}>
        <TextInput
          mode="outlined"
          label="Ollama Server's IP"
          placeholder="127.0.0.1:11434"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    flex: 1,
    padding: 10,
  }
});
