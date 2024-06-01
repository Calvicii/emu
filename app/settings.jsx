import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getSetting(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : "";
  } catch (error) {
    console.error("Error:", error);
    return "";
  }
}

export async function storeSetting(key, value) {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error:", error);
  }
}

export default function Settings() {

  // For global theming
  const theme = useTheme();

  // Ollama server's IP
  const [ip, setIp] = useState("");

  // Retrieve settings on mount
  useEffect(() => {
    async function fetchSettings() {
      const savedIp = await getSetting("ip");
      setIp(savedIp);
    }
    fetchSettings();
  }, []);

  function changeIp(ip) {
    setIp(ip);
    storeSetting("ip", ip);
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={styles.window}>
        <TextInput
          mode="outlined"
          label="Ollama Server's IP"
          placeholder="127.0.0.1:11434"
          contentStyle={{ fontFamily: "Outfit-Regular" }}
          value={ip}
          onChangeText={(val) => changeIp(val)}
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
