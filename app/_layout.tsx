import { Link, Stack, router } from 'expo-router';
import { View } from 'react-native';
import { MD3DarkTheme, PaperProvider, IconButton, ActivityIndicator } from 'react-native-paper';
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

export default function RootLayout() {

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
              />
            ),
            headerRight: () => (
              <Link href="settings" asChild>
                <IconButton
                  iconColor="white"
                  icon="cog"
                />
              </Link>
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
    </PaperProvider>
  );
}
