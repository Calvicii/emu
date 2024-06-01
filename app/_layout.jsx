import 'react-native-gesture-handler';
import { Drawer } from 'react-native-drawer-layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { MD3DarkTheme, PaperProvider, ActivityIndicator, IconButton, Button, Divider } from 'react-native-paper';
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

export async function storeChatMessages(chatId, messages) {
  try {
    let chats = await getChats();
    console.log("Existing chats:", chats);
    const chatIndex = chats.findIndex(chat => chat.id === parseInt(chatId));
    console.log("Chat index:", chatIndex);
    if (chatIndex !== -1) {
      chats[chatIndex].messages = messages;
      await storeChats(chats);
    } else {
      console.error(`Chat with id ${chatId} not found.`);
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

export default function RootLayout() {

  const [currentChatId, setCurrentChatId] = useState();

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  
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
    if (chats.length === 0) {
      newChatId = 0;
      chats.push({ id: newChatId, messages: [] });
    } else {
      newChatId = chats[chats.length - 1].id + 1;
      chats.push({ id: newChatId, messages: [] });
    }
    await storeChats(chats);
    setChats(chats);
    return newChatId;
  }

  async function handleDeleteChat(id) {
    await deleteChat(id);
    const updatedChats = await getChats();
    setChats(updatedChats);
  }

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
                      <Button
                        style={{ flex: 1 }}
                        labelStyle={{ fontFamily: "Outfit-Regular" }}
                        mode="outlined"
                        textColor={theme.colors.primary}
                        onPress={() => {
                          setOpen(false);
                          setCurrentChatId(item.id);
                          router.navigate({
                            pathname: "",
                            params: {
                              chatId: item.id,
                            }
                          })
                        }}
                      >
                        Chat {item.id}
                      </Button>
                      <IconButton
                        icon="delete"
                        iconColor={theme.colors.primary}
                        onPress={() => {
                          handleDeleteChat(item.id);
                          setCurrentChatId(undefined);
                          router.navigate({
                            pathname: "",
                            params: {
                              chatId: undefined,
                            }
                          })
                        }}
                      />
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
              title: "Chat " + currentChatId,
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
    flexDirection: "row",
    alignItems: "center",
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
  }
});