import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const chatIndex = chats.findIndex((chat) => chat.id === parseInt(id));
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
    const updatedChats = chats.filter((chat) => chat.id !== id);
    await storeChats(updatedChats);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function renameChat(id, name) {
  try {
    const chats = await getChats();
    const chatIndex = chats.findIndex((chat) => chat.id === parseInt(id));
    if (chatIndex !== -1) {
      chats[chatIndex].name = name;
      await storeChats(chats);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function getChatName(id) {
  try {
    const chats = await getChats();
    const chatIndex = chats.findIndex((chat) => chat.id === parseInt(id));
    if (chatIndex !== -1) return chats[chatIndex].name;
  } catch (error) {
    console.error("Error:", error);
  }
}

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