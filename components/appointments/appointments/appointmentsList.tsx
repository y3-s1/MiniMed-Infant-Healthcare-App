import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface AppointmentItem {
  id: string;
  midwife: string;
  date: string;
  location: string;
  time: string;
  status: 'Scheduled' | 'Completed';
}

// Mock appointments data
const appointmentsData: AppointmentItem[] = [
  {
    id: '1',
    midwife: 'Alice Smith',
    date: '2024-10-08',
    location: 'New York',
    time: '10:00 AM',
    status: 'Scheduled',
  },
  {
    id: '2',
    midwife: 'Megan Johnson',
    date: '2024-10-09',
    location: 'Los Angeles',
    time: '1:00 PM',
    status: 'Completed',
  },
  {
    id: '3',
    midwife: 'Sophia Brown',
    date: '2024-10-10',
    location: 'Chicago',
    time: '9:30 AM',
    status: 'Scheduled',
  },
  {
    id: '4',
    midwife: 'Emily Davis',
    date: '2024-10-11',
    location: 'Houston',
    time: '3:00 PM',
    status: 'Completed',
  },
  {
    id: '5',
    midwife: 'Alice Smith',
    date: '2024-10-08',
    location: 'New York',
    time: '10:00 AM',
    status: 'Scheduled',
  },
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f3f3', // Light gray background
    marginBottom: 64,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  activeTab: {
    borderBottomWidth: 4,
    borderColor: 'blue',
  },
  activeTabText: {
    color: 'blue',
    fontSize: 18,
  },
  inactiveTabText: {
    color: 'gray',
    fontSize: 18,
  },
  appointmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2, // For Android shadow
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 14,
  },
  infoContainerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  textGray: {
    color: 'gray',
  },
  button: {
    backgroundColor: 'cyan',
    padding: 8,
    width: 64,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  status: {
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
});

const AppointmentsList = () => {
  const [selectedTab, setSelectedTab] = useState<'All' | 'Scheduled' | 'Completed'>('All');

  const getFilteredAppointments = () => {
    if (selectedTab === 'All') {
      return appointmentsData;
    }
    return appointmentsData.filter((appointment) => appointment.status === selectedTab);
  };

  const renderAppointmentItem = ({ item, index }: { item: AppointmentItem, index: number }) => (
    <View style={styles.appointmentContainer}>
      <View style={styles.infoContainer}>
        <View style={styles.infoContainerIcon}>
          <Ionicons name='calendar-outline' size={20} color='black' />
        </View>
        <View>
          <Text style={styles.boldText}>{item.date} - {item.time}</Text>
          <Text style={{ fontSize: 18 }}>{item.midwife}</Text>
          <Text style={styles.textGray}>{item.location}</Text>
        </View>
      </View>
      <View style={styles.status}>
        <Text>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setSelectedTab('All')}
          style={[styles.tabButton, selectedTab === 'All' && styles.activeTab]}
        >
          <Text style={selectedTab === 'All' ? styles.activeTabText : styles.inactiveTabText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Scheduled')}
          style={[styles.tabButton, selectedTab === 'Scheduled' && styles.activeTab]}
        >
          <Text style={selectedTab === 'Scheduled' ? styles.activeTabText : styles.inactiveTabText}>Scheduled</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Completed')}
          style={[styles.tabButton, selectedTab === 'Completed' && styles.activeTab]}
        >
          <Text style={selectedTab === 'Completed' ? styles.activeTabText : styles.inactiveTabText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <FlatList
        data={getFilteredAppointments()}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}  // Hide the scroll bar
      />
    </View>
  );
};

export default AppointmentsList;
