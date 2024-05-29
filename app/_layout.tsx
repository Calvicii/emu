import { Stack } from "expo-router";
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: 'white',
    secondary: 'blue',
    background: '#333',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen
          name="index"
        />
      </Stack>
    </PaperProvider>
  );
}
