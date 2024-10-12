import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { UserContext } from '@/contexts/userContext';
import { router } from 'expo-router';

interface AppointmentItem {
  id: string;
  midwife: string;
  date: string;
  location: string;
  time: string;
  status: 'Scheduled' | 'Completed';
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f3f3f3',
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
    elevation: 2,
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
  status: {
    marginBottom: 16,
    alignSelf: 'flex-end',
  },
});

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'All' | 'Scheduled' | 'Completed'>('All');
  const { user } = useContext(UserContext);

  // Fetch appointments from Firestore
  const fetchAppointments = async () => {
    try {
      // Ensure user is available
      if (!user || !user.uid) {
        console.log('No user logged in');
        return;
      }
  
      const appointmentsCollectionRef = collection(db, 'MidwifeAppointments');
  
      // Create a query to get appointments where 'user' field matches 'user.uid'
      const q = query(appointmentsCollectionRef, where('user', '==', user.uid));
  
      // Fetch the documents based on the query
      const snapshot = await getDocs(q);
      
      const appointmentsList: AppointmentItem[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('appointments:', data);
        return {
          id: doc.id,
          midwife: data.midwifeId,  // Adjust if necessary
          date: data.date,
          location: data.location,
          time: data.timeSlot,
          status: data.status,
        };
      });
  
      setAppointments(appointmentsList);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  // Fetch appointments when the component mounts
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter appointments based on the selected tab
  const getFilteredAppointments = () => {
    if (selectedTab === 'All') {
      return appointments;
    }
    return appointments.filter((appointment) => appointment.status === selectedTab);
  };

  const renderAppointmentItem = ({ item }: { item: AppointmentItem }) => (
    <TouchableOpacity 
      onPress={() => router.navigate({
        pathname: '/appointments/appointments/singleAppointment',
        params: { 
          appointmentId: item.id,
          midwife: item.midwife,
          date: item.date,
          location: item.location,
          time: item.time,
          status: item.status,
         },  
      })}
    >
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
    </TouchableOpacity>
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
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AppointmentsList;
