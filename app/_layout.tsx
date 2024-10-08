import * as SecureStore from 'expo-secure-store'
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'


// const tokenCache = {
//   async getToken(key: string) {
//     try {
//       const item = await SecureStore.getItemAsync(key)
//       if (item) {
//         console.log(`${key} was used 🔐 \n`)
//       } else {
//         console.log('No values stored under key: ' + key)
//       }
//       return item
//     } catch (error) {
//       console.error('SecureStore get item error: ', error)
//       await SecureStore.deleteItemAsync(key)
//       return null
//     }
//   },
//   async saveToken(key: string, value: string) {
//     try {
//       return SecureStore.setItemAsync(key, value)
//     } catch (err) {
//       return
//     }
//   },
// }

// const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!

export default function RootLayout() {
  
  useFonts({
    'poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'poppins-bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'poppins-medium': require('../assets/fonts/Poppins-Medium.ttf')
  })

  return (
    // <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
    // </ClerkProvider>
  );
}
