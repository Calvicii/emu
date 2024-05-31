import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, TextInput, Text, IconButton, Button, Surface, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { getSetting } from './settings';

export default function Index() {

  // For global theming
  const theme = useTheme();

  // Ollama server's ip
  const [ip, setIp] = useState("");

  // For the modal's functions
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  // Available models
  const [models, setModels] = useState([]);

  // The user's current prompt
  const [prompt, setPrompt] = useState("");

  // The selected model to chat with
  const [selectedModel, setSelectedModel] = useState("");

  // The chat (includes user's chat and the model's chat)
  const [chat, setChat] = useState([]);

  // Boolean that indicates if the model is working on a response
  const [loading, setLoading] = useState(false);

  // Error message
  const [errorMessage, setErrorMessage] = useState("");

  // Reference the chat's FlatList
  const chatListRef = useRef();

  // Grab models and settings on modal show/hide
  useEffect(() => {
    getModels();
    console.log("refresh");

    async function fetchSettings() {
      const savedIp = await getSetting("ip");
      setIp(savedIp);
    }
    fetchSettings();
  }, [visible]);

  // Grab the models available on the machine
  async function getModels() {
    try {
      const response = await fetch(`http://${ip}/api/tags`);
      const data = await response.json();
      setModels(data.models);

      // Deselect the current model if it is not available on the server
      let containsModel = false
      for (let i = 0; i < data.models.length; ++i)
        if (data.models[i].name === selectedModel)
          containsModel = true;
      if (!containsModel) setSelectedModel("");
      setErrorMessage("");

    } catch (error) {
      setErrorMessage("The connection failed. Make sure the IP address is correct.");
      setModels("");
      setSelectedModel("");
    }
  }

  async function sendPrompt() {
    if (prompt !== "" && selectedModel !== "") {

      // Reset the TextInput
      setPrompt("");

      // Scroll to the message that was sent
      chatListRef.current.scrollToEnd();

      // Format the user's prompt
      let userMessage = {
        role: "user",
        content: prompt,
      };

      // Add it to the chat
      setChat([...chat, userMessage]);

      // Set loading to disable inputs
      setLoading(true);

      try {
        const response = await fetch(`http://${ip}/api/chat`, {
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

        // Receive the data
        const data = await response.json();

        // Add response to the chat
        setChat([...chat, userMessage, data.message]);
        setErrorMessage("");

      } catch (error) {
        setErrorMessage("The connection failed. Make sure the IP address is correct.");
      } finally {

        // Scroll to response
        chatListRef.current.scrollToEnd();

        // Set loading to enable inputs
        setLoading(false);
      }  
    }
  }

  return (
    <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
      <Portal>
        <Modal visible={visible} onDismiss={hideModal}>
          {models.length > 0 ? (
            <FlatList
              style={styles.modelList}
              data={models}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <Button
                  labelStyle={styles.modelListLabel}
                  onPress={() => {
                    setSelectedModel(item.name);
                    hideModal();
                  }}
                >
                  {item.name}
                </Button>
              )}
            />
            ) : (
              <View style={styles.modelList}>
                <Text style={styles.modelListLabel}>No models available</Text>
              </View>
            )
          }
        </Modal>
      </Portal>

      <View style={styles.window}>

        <View style={styles.options}>

        {selectedModel === "" ? (
              <Button style={styles.selectedMode} onPress={showModal} labelStyle={styles.selectedModeLabel}>
                Select a model
              </Button>
          ) : (
            <Button style={styles.selectedMode} onPress={showModal} labelStyle={styles.selectedModeLabel}>
              {selectedModel}
            </Button>
          )
        }

        </View>

        <View style={styles.chat}>

          {errorMessage !== "" ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : (
              <></>
            )
          }

          <FlatList
            ref={chatListRef}
            data={chat}
            renderItem={({ item }) => {
              if (item.role === "assistant") {
                return (
                  <Surface style={styles.modelBubble} mode="flat">
                    <Text style={styles.bubbleLabel}>{item.content}</Text>
                  </Surface>
                );
              }
              if (item.role === "user") {
                return (
                  <Surface style={styles.userBubble} mode="elevated">
                    <Text style={styles.bubbleLabel}>{item.content}</Text>
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
          contentStyle={styles.inputValue}
          mode="outlined"
          placeholder={"Message " + selectedModel}
          value={prompt}
          disabled={loading}
          onChangeText={(val) => setPrompt(val)}
        />
        <IconButton
          style={styles.sendButton}
          mode="contained"
          icon="arrow-up"
          disabled={loading}
          loading={loading}
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
    flex: 0,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: "white"
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  input: {
    flex: 1,
  },
  inputValue: {
    fontFamily: "Outfit-Regular",
  },
  sendButton: {
    marginLeft: 15,
  },
  selectedMode: {
    margin: "auto",
    width: "50%",
  },
  selectedModeLabel: {
    fontFamily: "Outfit-Medium",
    fontSize: 20,
  },
  modelList: {
    width: "50%",
    margin: "auto",
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 10,
  },
  modelListLabel: {
    fontFamily: "Outfit-Regular",
  },
  chat: {
    flex: 1,
  },
  modelBubble: {
    marginRight: 100,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  userBubble: {
    marginLeft: 100,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#444",
  },
  bubbleLabel: {
    fontFamily: "Outfit-Regular",
  },
  errorMessage: {
    flex: 0,
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    textAlign: "center",
    color: "red"
  }
});
