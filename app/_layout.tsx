import * as SecureStore from 'expo-secure-store'
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  
  const [fontsLoaded] = useFonts({
    'poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'poppins-medium': require('../assets/fonts/Poppins-Medium.ttf')
  })

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
  );
}
