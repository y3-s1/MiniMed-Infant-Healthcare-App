import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';

export default function RootLayout() {

  useFonts({
    'poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'poppins-medium': require('../assets/fonts/Poppins-Medium.ttf')
  })

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
