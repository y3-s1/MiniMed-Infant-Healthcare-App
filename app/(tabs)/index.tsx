import { router } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';

export default function Tab() {
  // const { user } = useUser();
  // const { signOut } = useAuth();

  // const logOut = () => {
  //   signOut();
  // };

  return (
    <View style={styles.container}>
      <Text> Monitoring page</Text>

      <TouchableOpacity onPress={() => router.push('/login/sign-in')}>
        <Text>Login</Text>
      </TouchableOpacity>
                                   {/* onPress={logOut} */}
      <TouchableOpacity >                        
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});