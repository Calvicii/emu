import React, { useEffect, useState } from "react";
import { View, StatusBar, StyleSheet, FlatList } from "react-native";
import {
  useTheme,
  TextInput,
  Text,
  IconButton,
  Button,
  Surface
} from "react-native-paper";

export default function Index() {
  const theme = useTheme();
  const [models, setModels] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("No model selected");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    getModels();
    console.log("refresh");
  }, []);

  async function getModels() {
    try {
      const response = await fetch("http://192.168.0.2:11434/api/tags");
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function sendPrompt() {
    console.log("Sent prompt: " + prompt);
    let userMessage = {
      role: "user",
      content: prompt
    }
    setChat([...chat, userMessage]);
    try {
      const response = await fetch("http://192.168.0.2:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...chat, userMessage],
          stream: false,
        }),
      });
      const data = await response.json();
      setChat([...chat, userMessage, data.message]);
      console.log(chat);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
      }}
    >
      <StatusBar backgroundColor={theme.colors.background} />
      <View style={styles.window}>
        <View style={styles.options}>

          <Text style={styles.selectedMode}>{selectedModel}</Text>

          <View style={styles.modelList}>
            {models.length > 0 ? (
              <FlatList
                data={models}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <Button onPress={() => setSelectedModel(item.name)}>
                    {item.name}
                  </Button>
                )}
              />
            ) : (
              <Text>No models available</Text>
            )}
          </View>
        </View>
        
        <View style={styles.chat}>
          <FlatList
            data={chat}
            renderItem={({ item }) => {
              if (item.role === "assistant") {
                return (
                  <Surface style={styles.modelBubble} mode="flat">
                    <Text>{item.content}</Text>
                  </Surface>
                );
              }
              if (item.role === "user") {
                return (
                  <Surface style={styles.userBubble} mode="flat">
                    <Text>{item.content}</Text>
                  </Surface>
                );
              }
            }}
          />
        </View>

      </View>
      <View style={styles.controls}>
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="Message Ollama"
          value={prompt}
          onChangeText={(val) => setPrompt(val)}
        />
        <IconButton
          style={styles.sendButton}
          mode="contained"
          icon="arrow-up"
          onPress={sendPrompt}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  window: {
    flex: 1,
    textAlign: "center",
  },
  options: {
    flex: 1,
    paddingVertical: 10,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
  },
  sendButton: {
    marginLeft: 15,
  },
  selectedMode: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
  },
  modelList: {
    flex: 2,
    width: "50%",
    margin: "auto",
  },
  chat: {
    flex: 4,
  },
  modelBubble: {
    marginRight: 100,
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },
  userBubble: {
    marginLeft: 100,
    margin: 10,
    padding: 10,
    borderRadius: 10,
  }
});
