import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, FlatList, Vibration, Pressable } from "react-native";
import {
  useTheme,
  TextInput,
  Text,
  IconButton,
  Button,
  Surface,
  Portal,
  Modal,
} from "react-native-paper";
import Markdown from "react-native-markdown-display";
import markdownStyles from "../constants/markdownStyles";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { getSetting, getChats, storeChatMessages, renameChat } from "./storage";
import { generateDate, stringToBool } from "./utils";
import i18n from "../constants/i18n";

export default function Index() {
  // Get the selected chat's ID
  const { chatId } = useLocalSearchParams();

  // Reference to currentChatId so it can change during prompt sending
  const currentChatIdRef = useRef(chatId);

  // For global theming
  const theme = useTheme();

  // Ollama server's IP
  const [ip, setIp] = useState("");

  // For auto renaming of chats
  const [autoRenameState, setAutoRenameState] = useState(false);

  // For the modal's functions
  const [visibleModal, setVisibleModal] = useState(false);
  const showModal = () => setVisibleModal(true);
  const hideModal = () => setVisibleModal(false);

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

  // Error messages
  const connErr = i18n.t("connectionFailed");

  // Down button visibility
  const [showDownButton, setShowDownButton] = useState(false);
  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    setShowDownButton(contentOffset.y > 100);
  };

  // Refresh the model list and grab the chat from storage
  useEffect(() => {
    console.log("refresh");

    if (chatId !== undefined) {
      // Retrieve the chat
      async function retrieveChat() {
        const chats = await getChats();
        const chatIndex = chats.findIndex(
          (chat) => chat.id === parseInt(chatId)
        );
        if (chatIndex !== -1) {
          const messages = chats[chatIndex].messages;
          setChat(messages);
        }
      }
      retrieveChat();

      // Refresh the list of models
      getModels();

      async function fetchSettings() {
        const savedIp = await getSetting("ip");
        const autoRename = await getSetting("autoRename");
        setIp(savedIp);
        setAutoRenameState(stringToBool(autoRename));
      }
      fetchSettings();
    }

    return setShowDownButton(false);
  }, [chatId, visibleModal]);

  // Update the reference to currentChatId
  useEffect(() => {
    currentChatIdRef.current = chatId;
  }, [chatId]);

  // Grab the models available on the machine
  async function getModels() {
    try {
      const response = await fetch(`${ip}/api/tags`);
      const data = await response.json();
      setModels(data.models);

      // Deselect the current model if it is not available on the server
      let containsModel = false;
      for (let i = 0; i < data.models.length; ++i)
        if (data.models[i].name === selectedModel) containsModel = true;
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
        chatListRef.current.scrollToOffset({ animated: true, offset: 0 });

        // Create the user's message object
        const userMessage = {
          role: "user",
          content: prompt,
          date: generateDate(),
        };

        // Update the chat state with the user's message
        setChat([...chat, userMessage]);

        // Store the updated chat state
        storeChatMessages(chatId, [...chat, userMessage]);

        // Send the request to the server
        const response = await fetch(`${ip}/api/chat`, {
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

        // Create the user's message object
        const assistantMessage = {
          role: "assistant",
          content: data.message.content,
          date: generateDate(),
          model: selectedModel,
        };

        // Update the chat state with the response if the user is still in the same chat
        if (currentChatIdRef.current === chatId) {
          setChat((prevChat) => [...prevChat, assistantMessage]);
        }

        // Store the updated chat state
        storeChatMessages(chatId, [...chat, userMessage, assistantMessage]);

        // Give haptic feedback
        Vibration.vibrate(1);

        // Clear any error message
        setErrorMessage("");
        if (chat.length === 0 && autoRenameState) {
          generateChatName(userMessage, assistantMessage);
        }
      } catch (error) {
        console.error(error);
        setErrorMessage(connErr);
      } finally {
        // Scroll to response
        chatListRef.current.scrollToOffset({ animated: true, offset: 0 });

        // Set loading to enable inputs
        setLoading(false);
      }
    }
  }

  async function generateChatName(userMessage, assistantMessage) {
    const chatNamePrompt = {
      role: "user",
      content:
        "You are an instruct model. Generate only a name for this conversation in exactly three words or fewer. Respond with no other text beyond the name. Do not explain your choice. No other output except the name is allowed.",
      date: generateDate(),
    };

    const response = await fetch(`${ip}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [userMessage, assistantMessage, chatNamePrompt],
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 5,
          top_k: 10,
          repeat_penalty: 1.5,
          presence_penalty: 1.0,
          frequency_penalty: 0.8,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message.");
    }

    const data = await response.json();

    renameChat(chatId, data.message.content);
  }

  if (chatId === undefined) {
    return (
      <View style={styles.noChatView}>
        <Text style={styles.noChatLabel}>{i18n.t("selectOrCreateAChat")}</Text>
      </View>
    );
  } else {
    return (
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <ModelList
          models={models}
          visibility={visibleModal}
          onDismiss={hideModal}
          onPress={setSelectedModel}
        />

        <View style={styles.window}>
          <View style={styles.options}>
            <ModelSelector selectedModel={selectedModel} onPress={showModal} />
          </View>

          <View style={styles.chat}>
            <ErrorMessage style={styles.errorMessage} error={errorMessage} />
            <FlatList
              inverted
              ref={chatListRef}
              data={[...chat].reverse()}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => {
                if (item !== undefined) {
                  return (
                    <ChatBubble
                      content={item.content}
                      date={item.date}
                      role={item.role}
                      model={item.model}
                    />
                  );
                }
              }}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={10}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              removeClippedSubviews={true}
            />
          </View>
          <IconButton
            style={[styles.downButton, !showDownButton && { opacity: 0 }]}
            mode="contained"
            icon="arrow-down"
            onPress={() => chatListRef.current.scrollToOffset(0)}
          />
        </View>

        <View style={styles.controls}>
          <TextInput
            style={styles.input}
            contentStyle={styles.inputValue}
            mode="outlined"
            multiline={true}
            placeholder={`${i18n.t("message")} ${selectedModel}`}
            value={prompt}
            disabled={loading || selectedModel === ""}
            onChangeText={(val) => setPrompt(val)}
          />
          <IconButton
            style={styles.sendButton}
            mode="contained"
            icon="arrow-up"
            disabled={loading || selectedModel === "" || prompt === ""}
            loading={loading}
            onPress={sendPrompt}
          />
        </View>
      </View>
    );
  }
}

// Bubble containing a chat message
function ChatBubble({ content, date, role, model }) {
  let mode = "flat";
  let style = styles.modelBubble;
  if (role === "user") {
    mode = "elevated";
    style = styles.userBubble;
  }

  let modelName = "";

  if (model !== undefined) {
    modelName = <Text style={styles.bubbleModel}>{model}</Text>;
  }

  return (
    <Pressable
      android_ripple={{ color: "#fff2" }}
      onLongPress={() => {
        Clipboard.setStringAsync(content);
        Vibration.vibrate(1);
      }}
    >
      <Surface style={style} mode={mode}>
        <Markdown style={markdownStyles}>{content}</Markdown>
        <Text style={styles.bubbleTimeStamp}>{date}</Text>
        {modelName}
      </Surface>
    </Pressable>
  );
}

// Button to open the list of models
function ModelSelector({ selectedModel, onPress }) {
  if (selectedModel === "") selectedModel = i18n.t("selectModel");
  return (
    <Button
      style={styles.selectedModel}
      onPress={onPress}
      labelStyle={styles.selectedModelLabel}
    >
      {selectedModel}
    </Button>
  );
}

// List of models the user can choose from
function ModelList({ models, visibility, onDismiss, onPress }) {
  if (models.length <= 0) {
    return (
      <Portal>
        <Modal visible={visibility} onDismiss={onDismiss}>
          <View style={styles.modelList}>
            <Text style={styles.modelListLabel}>{i18n.t("noModels")}</Text>
          </View>
        </Modal>
      </Portal>
    );
  }

  return (
    <Portal>
      <Modal visible={visibility} onDismiss={onDismiss}>
        <FlatList
          style={styles.modelList}
          data={models}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Button
              labelStyle={styles.modelListLabel}
              onPress={() => {
                onPress(item.name);
                onDismiss();
              }}
            >
              {item.name}
            </Button>
          )}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
        />
      </Modal>
    </Portal>
  );
}

function ErrorMessage({ error }) {
  if (error !== "") return <Text style={styles.errorMessage}>{error}</Text>;
  return <></>;
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
    borderColor: "white",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#333",
  },
  input: {
    flex: 1,
  },
  inputValue: {
    flex: 1,
    marginTop: 16,
    fontFamily: "Outfit-Regular",
  },
  sendButton: {
    marginLeft: 15,
  },
  selectedModel: {
    margin: "auto",
    alignSelf: "flex-start",
  },
  selectedModelLabel: {
    fontFamily: "Outfit-Medium",
    fontSize: 20,
    paddingHorizontal: 10,
  },
  modelList: {
    width: "50%",
    margin: "auto",
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 10,
  },
  modelListLabel: {
    fontFamily: "Outfit-Regular",
    textAlign: "center",
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
  bubbleTimeStamp: {
    marginTop: 10,
    fontFamily: "Outfit-Regular",
    fontSize: 10,
    color: "grey",
  },
  bubbleModel: {
    fontFamily: "Outfit-Regular",
    fontSize: 10,
    color: "grey",
  },
  errorMessage: {
    flex: 0,
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    textAlign: "center",
    color: "red",
  },
  noChatView: {
    flex: 1,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  noChatLabel: {
    fontSize: 30,
    fontFamily: "Outfit-Regular",
  },
  errorMessage: {
    margin: "auto",
    width: "80%",
    textAlign: "center",
    color: "red",
  },
  downButton: {
    position: "absolute",
    alignSelf: "flex-end",
    borderRadius: 10,
    bottom: 0,
    right: 10,
    zIndex: 10,
  },
});
