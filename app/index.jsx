import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme, TextInput, Text, IconButton, Button, Surface, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams } from "expo-router";
import { getSetting } from './settings';
import { getChats, storeChatMessages } from './_layout';

export default function Index() {

  // Get the selected chat's ID
  const { chatId } = useLocalSearchParams();

  // For global theming
  const theme = useTheme();

  // Ollama server's IP
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

  // Refresh the model list and grab the chat from storage
  useEffect(() => {
    console.log("refresh");
  
    if (chatId !== undefined) {
      async function retrieveChat() {
        const chats = await getChats();
        const chatIndex = chats.findIndex(chat => chat.id === parseInt(chatId));
        if (chatIndex !== -1) {
          const messages = chats[chatIndex].messages;
          console.log(messages);
          setChat(messages);
        }
      }      
      retrieveChat();

      getModels();

      async function fetchSettings() {
        const savedIp = await getSetting("ip");
        setIp(savedIp);
      }
      fetchSettings();
    }
  }, [chatId, visible]);  

  // Boolean that indicates if the model is working on a response
  const [loading, setLoading] = useState(false);

  // Error message
  const [errorMessage, setErrorMessage] = useState("");

  // Reference the chat's FlatList
  const chatListRef = useRef();

  // Error messages
  const connErr = "Connection failed. Make sure the IP address is correct.";

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
      setErrorMessage(connErr);
      setModels("");
      setSelectedModel("");
    }
  }

  async function sendPrompt() {
    if (prompt !== "" && selectedModel !== "") {
      try {
        // Reset the TextInput
        setPrompt("");
  
        // Set loading to disable inputs
        setLoading(true);
  
        // Scroll to the message that was sent
        chatListRef.current.scrollToEnd();
  
        // Create the user's message object
        const userMessage = {
          role: "user",
          content: prompt,
        };
  
        // Send the request to the server
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
  
        // Check if the response is successful
        if (!response.ok) {
          throw new Error("Failed to send message.");
        }
  
        // Receive the data from the response
        const data = await response.json();
  
        // Update the chat state with the response and user's message
        setChat(prevChat => [...prevChat, userMessage, data.message]);
  
        // Store the updated chat state
        storeChatMessages(chatId, [...chat, userMessage, data.message]);
  
        // Clear any error message
        setErrorMessage("");
      } catch (error) {
        console.error(error);
        setErrorMessage(connErr);
      } finally {
        // Scroll to response
        chatListRef.current.scrollToEnd();
  
        // Set loading to enable inputs
        setLoading(false);
      }
    }
  }

  if (chatId === undefined) {
    return (
      <View style={styles.noChatView}>
        <Text style={styles.noChatLabel}>Select or create a chat</Text>
      </View>
    );
  } else {
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
                if (item !== undefined) {
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
  },
  noChatView: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  noChatLabel: {
    fontSize: 30,
    fontFamily: "Outfit-Regular"
  }
});
