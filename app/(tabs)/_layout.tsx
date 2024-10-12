import React, { useEffect, useState } from 'react';
import { Button, View, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Feather from '@expo/vector-icons/Feather';
import { Tabs } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AuthGuard from '@/components/AuthGuard';  // Assuming you have an AuthGuard component for handling auth
import Constants from 'expo-constants'; // For getting the projectId

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function TabLayout() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    // Register for push notifications on app load
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // Listen for notifications when the app is in foreground
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();  // Clean up notification listener on unmount
  }, []);


  return (
    <AuthGuard>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#2896B5' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="vaccination"
          options={{
            title: 'Vaccination',
            tabBarIcon: ({ color }) => <MaterialIcons name="vaccines" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="appointments"
          options={{
            title: 'Appointments',
            tabBarIcon: ({ color }) => <FontAwesome5 name="tasks" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <AntDesign name="user" size={24} color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}

// Helper function to register for push notifications
async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return;
    }
    
    // Retrieve projectId
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.error('Project ID not found!');
      return;
    }

    // Pass projectId when calling getExpoPushTokenAsync
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
