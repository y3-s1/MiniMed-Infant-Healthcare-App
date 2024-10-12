import { auth } from '@/config/FireBaseConfig';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { UserContext } from '@/contexts/userContext';
import { useContext } from 'react';
import * as Notifications from 'expo-notifications';

export default function Tab() {

    const { user, selectedChildId } = useContext(UserContext);

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

        // Function to schedule a notification (e.g., for reminder or event)
  const scheduleReminderNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Reminder!',
        body: 'This is your scheduled reminder!',
        sound: 'default',
      },
      trigger: {
        seconds: 10,  // Notification will trigger after 10 seconds
      },
    });
  };
  return (
    <View style={styles.container}>
      <Text> Monitoring page</Text>
      <Text>User UID: {user ? user.uid : 'No user signed in'}</Text>
      <Text>Child UID: {selectedChildId ? selectedChildId : 'No Child signed in'}</Text>

      <View>
      <Button title="Set Reminder" onPress={scheduleReminderNotification} />
    </View>

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