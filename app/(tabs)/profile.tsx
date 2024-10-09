import { auth } from '@/config/FireBaseConfig';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserContext } from '@/contexts/userContext';
import { useContext } from 'react';

export default function Tab() {

    const { user } = useContext(UserContext);

    const handleSignOut = () => {
        signOut(auth)
          .then(() => {
            console.log('User signed out!');
            // Navigate to the sign-in page after successful sign-out
            router.push('/login/sign-in');
          })
          .catch((error) => {
            console.error('Error signing out: ', error);
          });
      };
  return (
    <View style={styles.container}>
      <Text> Monitoring page</Text>
      <Text>User UID: {user ? user.uid : 'No user signed in'}</Text>

      <TouchableOpacity onPress={handleSignOut}>
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