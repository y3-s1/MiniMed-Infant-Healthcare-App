import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, Modal,TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../../../config/FireBaseConfig'; // Import Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import SearchBar from '../SearchBar/SearchBar'; // Import the updated SearchBar
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { router } from 'expo-router';


// Define the type for your event object
type Event = {
  id: string;
  EventTitle: string;
  EventImage: string;
  EventDate: string;
  EventDescription: string;
  EventLocation: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed'; // Add a status field for filtering if necessary
};

export default function CompletedEventsList() {
  const [events, setEvents] = useState<Event[]>([]); // State to hold events
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
  const [filterVisible, setFilterVisible] = useState<boolean>(false); // State for filter modal visibility
  const [titleFilter, setTitleFilter] = useState<string>(''); // State for title filter
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false); // State for showing date picker

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true); // Set loading to true while fetching
        const querySnapshot = await getDocs(collection(db, "Events"));
        const fetchedEvents: Event[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({
            id: doc.id,
            EventTitle: data.EventTitle,
            EventImage: data.EventImage,
            EventDate: data.EventDate,
            EventDescription: data.EventDescription,
            EventLocation: data.EventLocation,
            status: getEventStatus(data.EventDate), // Compute the status
          });
        });
        setEvents(fetchedEvents.filter(event => event.status === 'Completed')); // Filter for completed events
      } catch (error) {
        console.error("Error fetching events: ", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchEvents(); // Call fetch function
  }, []);

  // Function to determine the status based on the event date
  const getEventStatus = (eventDate: string): 'Upcoming' | 'Ongoing' | 'Completed' => {
    const currentDate = new Date();
    const eventDateObj = new Date(eventDate);
    if (eventDateObj < currentDate) {
      return 'Completed';
    } else if (eventDateObj.toDateString() === currentDate.toDateString()) {
      return 'Ongoing';
    } else {
      return 'Upcoming';
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => router.push(`/events/EventDetails?id=${item.id}`)} >
      <Image source={{ uri: item.EventImage }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.EventTitle}</Text>
        <Text style={styles.eventDate}>{item.EventDate}</Text>
        <View style={styles.eventFooter}>
          <View style={styles.completedContainer}>
            <FontAwesome name="check-circle" size={20} color="#28A745" />
            <Text style={styles.completedText}>Completed</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>; // Loading state
  }

  return (
    <View style={styles.container}>
      <SearchBar onFilterPress={() => setFilterVisible(true)} />

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      />

      {/* Filter Modal (if you want to keep filtering capability) */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Completed Events</Text>
            <TextInput
              placeholder="Filter by Title"
              style={styles.filterInput}
              value={titleFilter}
              onChangeText={setTitleFilter}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => setFilterVisible(false)} style={styles.closeButton}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 1,
  },
  eventImage: {
    width: '100%',
    height: 150,
  },
  eventInfo: {
    padding: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    marginLeft: 4,
    color: '#28A745',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#6C757D',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
