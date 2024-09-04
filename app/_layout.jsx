import 'react-native-gesture-handler';
import { Drawer } from 'react-native-drawer-layout';
import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Vibration } from 'react-native';
import { MD3DarkTheme, PaperProvider, ActivityIndicator, IconButton, Button, Divider, Menu, Portal, Modal, TextInput, Text } from 'react-native-paper';
import { Link, Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import { getChats, storeChats, deleteChat, renameChat, getChatName } from './storage';
import { generateDate, getChatDate, sortChatsFromDates } from './utils';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'white',
    background: '#333',
    header: '#444',
  },
};

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
  const [sortedChats, setSortedChats] = useState([[], [], []]);

  // For managing visible menu
  const [visibleMenuId, setVisibleMenuId] = useState(null);
  
  // Extra fonts for the app
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
    'RobotoMono-Bold': require('../assets/fonts/RobotoMono-Bold.ttf'),
    'RobotoMono-BoldItalic': require('../assets/fonts/RobotoMono-BoldItalic.ttf'),
    'RobotoMono-ExtraLight': require('../assets/fonts/RobotoMono-Bold.ttf'),
    'RobotoMono-ExtraLightItalic': require('../assets/fonts/RobotoMono-BoldItalic.ttf'),
    'RobotoMono-Italic': require('../assets/fonts/RobotoMono-Italic.ttf'),
    'RobotoMono-Light': require('../assets/fonts/RobotoMono-Light.ttf'),
    'RobotoMono-LightItalic': require('../assets/fonts/RobotoMono-LightItalic.ttf'),
    'RobotoMono-Medium': require('../assets/fonts/RobotoMono-Medium.ttf'),
    'RobotoMono-MediumItalic': require('../assets/fonts/RobotoMono-MediumItalic.ttf'),
    'RobotoMono-Regular': require('../assets/fonts/RobotoMono-Regular.ttf'),
    'RobotoMono-SemiBold': require('../assets/fonts/RobotoMono-SemiBold.ttf'),
    'RobotoMono-SemiBoldItalic': require('../assets/fonts/RobotoMono-SemiBoldItalic.ttf'),
    'RobotoMono-Thin': require('../assets/fonts/RobotoMono-Thin.ttf'),
    'RobotoMono-ThinItalic': require('../assets/fonts/RobotoMono-ThinItalic.ttf'),
  });

  // Retrieve the chats and sort them
  useEffect(() => {
    async function loadChats() {
      const storedChats = await getChats();
      setChats(storedChats);
    }
    loadChats();
  }, [open]);

  // Sort the chats
  useEffect(() => {
    setSortedChats(sortChats([...chats]));
  }, [chats, open]);

  // Show a loading screen if the fonts have not loaded yet
  if (!fontsLoaded) {
    return (
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <ActivityIndicator style={{ flex: 1 }} animating={true} size="large" color="white" />
      </View>
    );
  }

  // Create a new chat
  async function newChat() {
    let chats = await getChats();
    let newChatId;
    if (chats.length === 0)
      newChatId = 0;
    else
      newChatId = chats[chats.length - 1].id + 1;
    chats.push({ id: newChatId, name: "New Chat", date: generateDate(), messages: [] }); //TODO
    await storeChats(chats);
    setChats(chats);
    return newChatId;
  }

  // Delete a chat
  async function handleDeleteChat(id) {
    await deleteChat(id);
    const updatedChats = await getChats();
    setChats(updatedChats);
    if (currentChatId === id) {
      setCurrentChatName("");
      router.navigate({
        pathname: "",
        params: {
          chatId: undefined,
        }
      });
    }
  }

  // Rename a chat
  async function handleRenameChat(id, name) {
    await renameChat(id, name);
    const updatedChats = await getChats();
    setChats(updatedChats);
    if (currentChatId === id)
      setCurrentChatName(name);
    hideRename();
  }

  // Create the timeline labels in the chat list
  function generateTimelineLabel(chat) {
    if (chat.length > 0) {
      let today = new Date();
      let comparedDate = getChatDate(chat[0]);

      if (today.getDate() === comparedDate.getDate() && today.getMonth() + 1 === comparedDate.getMonth() && today.getFullYear() == comparedDate.getFullYear()) {
        return "Today";
      } else if (today.getDate() === comparedDate.getDate() + 1 && today.getMonth() + 1 === comparedDate.getMonth() && today.getFullYear() == comparedDate.getFullYear()) {
        return "Yesterday";
      } else {
        return "Once upon a time...";
      }
    } else {
      return "";
    }
  }

  // Sort the chats into lists depending on the last time they were modified
  function sortChats(chats) {
    let todayChats = [];
    let yesterdayChats = [];
    let pastChats = [];

    for (let chat of chats) {
      let today = new Date();
      let comparedDate = getChatDate(chat);

      if (today.getDate() === comparedDate.getDate() && today.getMonth() + 1 === comparedDate.getMonth() && today.getFullYear() == comparedDate.getFullYear()) {
        todayChats.push(chat);
      } else if (today.getDate() === comparedDate.getDate() + 1 && today.getMonth() + 1 === comparedDate.getMonth() && today.getFullYear() == comparedDate.getFullYear()) {
        yesterdayChats.push(chat);
      } else {
        pastChats.push(chat);
      }
    }

    if (todayChats.length > 0)
      todayChats = sortChatsFromDates(todayChats);

    if (yesterdayChats.length > 0)
      yesterdayChats = sortChatsFromDates(yesterdayChats);

    if (pastChats.length > 0)
      pastChats = sortChatsFromDates(pastChats);

    return [todayChats, yesterdayChats, pastChats];
  }

  // Long presses on buttons
  const handleLongPress = (id) => {
    Vibration.vibrate(1);
    setVisibleMenuId(id);
  };

  // Close the context menu
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
                    setCurrentChatId(newChatId);
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
                  data={sortedChats}
                  renderItem={({ item }) => (
                    <>
                      <Text style={styles.chatTimeStamp}>{generateTimelineLabel(item)}</Text>
                      <FlatList
                        style={styles.chatList}
                        data={[...item].reverse()}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                          <View style={styles.chatItem}>
                            <Menu
                            contentStyle={styles.menu}
                              visible={visibleMenuId === item.id}
                              onDismiss={handleCloseMenu}
                              anchor={
                                <>
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
                                </>
                              }
                            >
                              <Menu.Item titleStyle={styles.menuItemLabel} onPress={() => showRename(item.id)} title="Rename" leadingIcon="pencil" />
                              <Menu.Item titleStyle={styles.menuItemLabel} onPress={() => handleDeleteChat(item.id)} title="Delete" leadingIcon="delete" />
                            </Menu>
                          </View>
                        )}
                      />
                    </>
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
                      autoFocus={true}
                      style={styles.renameInput}
                      contentStyle={styles.renameInputValue}
                      mode="outlined"
                      label="Rename"
                      onChangeText={(val) => setNewChatName(val)}
                    />
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                      <Button
                        style={styles.confirmButton}
                        labelStyle={styles.menuItemButton}
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
                        labelStyle={styles.menuItemButton}
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
  chatTimeStamp: {
    fontFamily: "Outfit-Bold",
    fontSize: 20,
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
  renameInputValue: {
    fontFamily: "Outfit-Regular",
  },
  confirmButton: {
    flex: 1,
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 5,
  },
  menuItemLabel: {
    fontFamily: "Outfit-Regular",
  },
  menuItemButton: {
    fontFamily: "Outfit-Regular",
  }
});