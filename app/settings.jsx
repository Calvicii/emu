import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, TextInput } from 'react-native-paper';
import { getSetting, storeSetting } from './storage';

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

  // Change the IP setting
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