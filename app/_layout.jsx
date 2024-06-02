import 'react-native-gesture-handler';
import { Drawer } from 'react-native-drawer-layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Vibration } from 'react-native';
import { MD3DarkTheme, PaperProvider, ActivityIndicator, IconButton, Button, Divider, Menu, Portal, Modal, TextInput } from 'react-native-paper';
import { Link, Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'white',
    background: '#333',
    header: '#444',
  },
};

export async function getChats() {
  try {
    const value = await AsyncStorage.getItem("chats");
    return value !== null ? JSON.parse(value) : [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function storeChats(chats) {
  try {
    await AsyncStorage.setItem("chats", JSON.stringify(chats));
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function storeChatMessages(id, messages) {
  try {
    let chats = await getChats();
    const chatIndex = chats.findIndex(chat => chat.id === parseInt(id));
    if (chatIndex !== -1) {
      chats[chatIndex].messages = messages;
      await storeChats(chats);
    } else {
      console.error(`Chat with id ${id} not found.`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function deleteChat(id) {
  try {
    const chats = await getChats();
    const updatedChats = chats.filter(chat => chat.id !== id);
    await storeChats(updatedChats);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function renameChat(id, name) {
  try {
    const chats = await getChats();
    const chatIndex = chats.findIndex(chat => chat.id === parseInt(id));
    if (chatIndex !== -1) {
      chats[chatIndex].name = name;
      await storeChats(chats)
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getChatName(id) {
  try {
    const chats = await getChats();
    const chatIndex = chats.findIndex(chat => chat.id === parseInt(id));
    if (chatIndex !== -1)
      return chats[chatIndex].name;
  } catch (error) {
    console.error("Error:", error);
  }
}

export default function RootLayout() {

  // Selected chat's ID
  const [currentChatId, setCurrentChatId] = useState();

  // Selected chat's name
  const [currentChatName, setCurrentChatName] = useState("");

  // To open/close the drawer
  const [open, setOpen] = useState(false);

  // To open/close the rename window
  const [visibleRename, setVisibleRename] = useState(false);
  function showRename(id) {
    setRenameChatId(id);
    console.log(renameChatId);
    setVisibleMenuId(null);
    setVisibleRename(true);
  };
  function hideRename() {
    setVisibleRename(false);
    setRenameChatId(null);
  };

  // To rename a chat
  const [renameChatId, setRenameChatId] = useState(null);
  const [newChatName, setNewChatName] = useState("");

  // All stored chats
  const [chats, setChats] = useState([]);

  // For managing visible menu
  const [visibleMenuId, setVisibleMenuId] = useState(null);
  
  const [fontsLoaded] = useFonts({
    'Outfit': require('../assets/fonts/Outfit-VariableFont.ttf'),
    'Outfit-Black': require('../assets/fonts/Outfit-Black.ttf'),
    'Outfit-Bold': require('../assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('../assets/fonts/Outfit-ExtraBold.ttf'),
    'Outfit-ExtraLight': require('../assets/fonts/Outfit-ExtraLight.ttf'),
    'Outfit-Light': require('../assets/fonts/Outfit-Light.ttf'),
    'Outfit-Medium': require('../assets/fonts/Outfit-Medium.ttf'),
    'Outfit-Regular': require('../assets/fonts/Outfit-Regular.ttf'),
    'Outfit-SemiBold': require('../assets/fonts/Outfit-SemiBold.ttf'),
    'Outfit-Thin': require('../assets/fonts/Outfit-Thin.ttf'),
  });

  useEffect(() => {
    async function loadChats() {
      const storedChats = await getChats();
      setChats(storedChats);
    }
    loadChats();
  }, []);

  // Show a loading screen if the fonts have not loaded yet
  if (!fontsLoaded) {
    return (
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <ActivityIndicator style={{ flex: 1 }} animating={true} size="large" color="white" />
      </View>
    );
  }

  async function newChat() {
    let chats = await getChats();
    let newChatId;
    if (chats.length === 0)
      newChatId = 0;
    else
      newChatId = chats[chats.length - 1].id + 1;
    chats.push({ id: newChatId, name: "New Chat", messages: [] });
    await storeChats(chats);
    setChats(chats);
    return newChatId;
  }

  async function handleDeleteChat(id) {
    await deleteChat(id);
    const updatedChats = await getChats();
    setChats(updatedChats);
    if (currentChatId === id)
      setCurrentChatName("");
      router.navigate({
        pathname: "",
        params: {
          chatId: undefined,
        }
      });
  }

  async function handleRenameChat(id, name) {
    await renameChat(id, name);
    const updatedChats = await getChats();
    setChats(updatedChats);
    if (currentChatId === id)
      setCurrentChatName(name);
    hideRename();
  }

  const handleLongPress = (id) => {
    Vibration.vibrate(1);
    setVisibleMenuId(id);
  };

  const handleCloseMenu = () => setVisibleMenuId(null);

  return (
    <PaperProvider theme={theme}>
      <Drawer
        drawerType="slide"
        drawerStyle={{
          backgroundColor: theme.colors.background,
          width: 250,
        }}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderDrawerContent={() => {
          return (
            <View style={styles.drawer}>
              <View style={styles.chats}>
                <Button
                  mode="outlined"
                  icon="plus"
                  labelStyle={{ fontFamily: "Outfit-Regular" }}
                  textColor={theme.colors.primary}
                  onPress={async () => {
                    const newChatId = await newChat();
                    setOpen(false);
                    setCurrentChatName("New Chat");
                    router.navigate({
                      pathname: "",
                      params: {
                        chatId: newChatId,
                      }
                    });
                  }}
                >
                  New Chat
                </Button>
                <Divider style={styles.divider} />
                <FlatList
                  style={styles.chatList}
                  data={chats}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.chatItem}>
                      <Menu
                      contentStyle={styles.menu}
                        visible={visibleMenuId === item.id}
                        onDismiss={handleCloseMenu}
                        anchor={
                          <Button
                            labelStyle={{ fontFamily: "Outfit-Regular" }}
                            mode="outlined"
                            textColor={theme.colors.primary}
                            onLongPress={() => handleLongPress(item.id)}
                            onPress={() => {
                              setOpen(false);
                              setCurrentChatId(item.id);
                              async function setCurrentName() {
                                let name = await getChatName(item.id);
                                setCurrentChatName(name);
                              }
                              setCurrentName();
                              router.navigate({
                                pathname: "",
                                params: {
                                  chatId: item.id,
                                }
                              });
                            }}
                          >
                            {item.name}
                          </Button>
                        }
                      >
                        <Menu.Item onPress={() => showRename(item.id)} title="Rename" leadingIcon="pencil" />
                        <Menu.Item onPress={() => handleDeleteChat(item.id)} title="Delete" leadingIcon="delete" />
                      </Menu>
                    </View>
                  )}
                />
              </View>
              <Link href="settings" asChild>
                <Button
                  style={styles.navSettings}
                  labelStyle={{ fontFamily: "Outfit-Regular" }}
                  mode="contained-tonal"
                  icon="cog"
                  onPress={() => setOpen(false)}
                >
                  Settings
                </Button>
              </Link>
              <Portal>
                <Modal visible={visibleRename} onDismiss={hideRename}>
                  <View style={styles.renameWindow}>
                    <TextInput
                      style={styles.renameInput}
                      mode="outlined"
                      label="Rename"
                      onChangeText={(val) => setNewChatName(val)}
                    />
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                      <Button
                        style={styles.confirmButton}
                        mode="contained-tonal"
                        onPress={() => {
                          handleRenameChat(renameChatId, newChatName);
                          setRenameChatId(null);
                          setNewChatName("");
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        style={styles.cancelButton}
                        mode="outlined"
                        onPress={hideRename}
                      >
                        Cancel
                      </Button>
                    </View>
                  </View>
                </Modal>
              </Portal>
            </View>
          );
        }}
      >
        <Stack>
          <Stack.Screen
            name="index"
            initialParams={{
              currentChatId: 1,
            }}
            options={{
              title: currentChatName,
              statusBarColor: theme.colors.background,
              headerStyle: {
                backgroundColor: theme.colors.header,
              },
              headerTitleStyle: {
                fontFamily: "Outfit-Bold",
                color: theme.colors.primary,
              },
              headerLeft: () => (
                <IconButton
                  iconColor="white"
                  icon="menu"
                  onPress={() => setOpen(true)}
                />
              ),
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              title: "Settings",
              statusBarColor: theme.colors.background,
              headerStyle: {
                backgroundColor: theme.colors.header,
              },
              headerTitleStyle: {
                fontFamily: "Outfit-Bold",
                color: theme.colors.primary,
              },
              headerLeft: () => (
                <IconButton
                  iconColor="white"
                  icon="arrow-left"
                  onPress={() => router.back()}
                />
              ),
            }}
          />
        </Stack>
      </Drawer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    padding: 10,
    paddingTop: 5,
  },
  chats: {
    flex: 1,
  },
  chatItem: {
    marginBottom: 5,
  },
  navSettings: {
    flex: 0,
  },
  divider: {
    marginVertical: 10,
    height: 2,
  },
  chatList: {
    marginBottom: 10,
  },
  menu: {
    backgroundColor: theme.colors.header,
    borderRadius: 10,
  },
  renameWindow: {
    margin: "auto",
    padding: 10,
    width: "75%",
    height: 125,
    backgroundColor: theme.colors.header,
    borderRadius: 10,
  },
  renameInput: {
    backgroundColor: theme.colors.header,
  },
  confirmButton: {
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
  }
});