import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

const Notification = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 1, title: 'OPV 2', description: 'Corem ipsum dolor sit amet.', date: '19 oct 2024', read: false },
    { id: 2, title: 'Pentavalent 3', description: 'Corem ipsum dolor sit amet.', date: '24 nov 2024', read: false },
  ]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <View style={styles.notificationItem}>
      <Ionicons name={item.read ? "notifications-off" : "notifications"} size={24} color="black" />
      <View style={styles.notificationText}>
        <Text style={[styles.notificationTitle, item.read ? styles.read : styles.unread]}>
          {item.title}
        </Text>
        <Text style={styles.notificationDescription}>{item.description}</Text>
      </View>
      <Text style={styles.notificationDate}>{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top buttons */}
      <View style={styles.header}>
        <Text style={styles.mostRecent}>Most Recent</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.markAsRead}>Mark As Read</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={clearAllNotifications}>
          <Text style={styles.clearAll}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Notification list */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text style={styles.noNotifications}>No notifications</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  mostRecent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  markAsRead: {
    fontSize: 16,
    color: '#888',
  },
  clearAll: {
    fontSize: 16,
    color: '#ff0000',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  notificationText: {
    flex: 1,
    marginLeft: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
  },
  notificationDate: {
    fontSize: 14,
    color: '#999',
  },
  read: {
    color: '#888',
  },
  unread: {
    color: '#000',
  },
  noNotifications: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default Notification;
