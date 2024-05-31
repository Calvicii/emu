import 'react-native-gesture-handler';
import { Drawer } from 'react-native-drawer-layout';
import { useState } from 'react';
import { View } from 'react-native';
import { MD3DarkTheme, PaperProvider, ActivityIndicator, IconButton, Button } from 'react-native-paper';
import { Link, Stack, router } from 'expo-router';
import { useFonts } from 'expo-font';
import Index from './index';
import Settings from './settings';

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

  const [open, setOpen] = useState(false);

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

  // Show a loading screen if the fonts have not loaded yet
  if (!fontsLoaded) {
    return (
      <View style={{ backgroundColor: theme.colors.background, flex: 1 }}>
        <ActivityIndicator style={{ flex: 1 }} animating={true} size="large" color="white" />
      </View>
    );
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
              <View
                style={{
                  flex: 1,
                  padding: 10,
                  paddingTop: 5,
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Button
                    mode="outlined"
                    icon="plus"
                    textColor={theme.colors.primary}
                    onPress={() => console.log("New Chat")}
                  >
                    New Chat
                  </Button>
                </View>
                <Link href="settings" asChild>
                  <Button
                    style={{
                      flex: 0,
                    }}
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
              options={{
                title: "New Chat",
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
