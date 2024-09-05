import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, TextInput, Switch, Text, Surface } from 'react-native-paper';
import { getSetting, storeSetting } from './storage';
import { stringToBool } from './utils';
import i18n from '../constants/i18n';

export default function Settings() {

  // For global theming
  const theme = useTheme();

  // Ollama server's IP
  const [ip, setIp] = useState("");

  // To make the auto-rename-chat switch work
  const [autoRenameState, setAutoRenameState] = useState(false);

  // Retrieve settings on mount
  useEffect(() => {
    async function fetchSettings() {
      const savedIp = await getSetting("ip");
      const autoRename = await getSetting("autoRename")
      setIp(savedIp);
      setAutoRenameState(stringToBool(autoRename));
    }
    fetchSettings();
  }, []);

  // Change the IP setting
  function changeIp(ip) {
    setIp(ip);
    storeSetting("ip", ip);
  }

  function changeAutoRename(state) {
    setAutoRenameState(state);
    storeSetting("autoRename", String(state));
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <View style={styles.window}>
        <TextInput
          mode="outlined"
          label={i18n.t("ollamaServerIP")}
          placeholder="127.0.0.1:11434"
          contentStyle={{ fontFamily: "Outfit-Regular" }}
          value={ip}
          onChangeText={(val) => changeIp(val)}
        />
        <Surface style={styles.autoRenameSurface}>
          <Text style={styles.autoRenameText}>{i18n.t("autoRename")}</Text>
          <Switch value={autoRenameState} onValueChange={() => changeAutoRename(!autoRenameState)} color='' />
        </Surface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    flex: 1,
    padding: 10,
  },
  autoRenameSurface: {
    margin: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    borderRadius: 10,
    backgroundColor: "#444",
  },
  autoRenameText: {
    fontFamily: "Outfit-Regular",
    fontSize: 16,
  }
});