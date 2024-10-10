import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
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

export default function AllEvents() {
  
  const [events, setEvents] = useState<Event[]>([]); // State to hold events
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading state
  const [filterVisible, setFilterVisible] = useState<boolean>(false); // State for filter modal visibility
  const [titleFilter, setTitleFilter] = useState<string>(''); // State for title filter
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined); // State for date filter
  const [monthFilter, setMonthFilter] = useState<number | undefined>(undefined); // State for month filter
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined); // State for year filter
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false); // State for showing date picker

  useEffect(() => {
    fetchEvents(); // Fetch events on component mount
  }, []);

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
      setEvents(fetchedEvents); // Update state with fetched events
    } catch (error) {
      console.error("Error fetching events: ", error);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

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

  const applyFilters = () => {
    // Filter events based on title, date, month, and year
    const filteredEvents = events.filter(event => {
      const matchesTitle = event.EventTitle.toLowerCase().includes(titleFilter.toLowerCase());
      const eventDateObj = new Date(event.EventDate);
      const matchesDate = dateFilter ? eventDateObj.toDateString() === dateFilter.toDateString() : true;
      const matchesMonth = monthFilter !== undefined ? eventDateObj.getMonth() + 1 === monthFilter : true; // Months are 0-based
      const matchesYear = yearFilter !== undefined ? eventDateObj.getFullYear() === yearFilter : true;

      return matchesTitle && matchesDate && matchesMonth && matchesYear;
    });
    setEvents(filteredEvents); // Update the events state with filtered events
    setFilterVisible(false); // Close the filter modal
  };

  const resetFilters = async () => {
    // Reset all filters and re-fetch events
    setTitleFilter('');
    setDateFilter(undefined);
    setMonthFilter(undefined);
    setYearFilter(undefined);
    await fetchEvents(); // Re-fetch events
    setFilterVisible(false); // Close the filter modal
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => router.push(`/events/EventDetails?id=${item.id}`)} >
      <Image source={{ uri: item.EventImage }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.EventTitle}</Text>
        <Text style={styles.eventDate}>{item.EventDate}</Text>
        <View style={styles.eventFooter}>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>5.0</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>; // Loading state
  }

  // Filter events to only show upcoming events
  const upcomingEvents = events.filter(event => event.status === 'Upcoming');

  return (
    <View style={styles.container}>
      <SearchBar onFilterPress={() => setFilterVisible(true)} />

      <FlatList
        data={upcomingEvents} // Use the filtered upcoming events
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
      />

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Events</Text>
            <TextInput
              placeholder="Filter by Title"
              style={styles.filterInput}
              value={titleFilter}
              onChangeText={setTitleFilter}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                {dateFilter ? dateFilter.toDateString() : "Select Date"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateFilter || new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDateFilter(selectedDate); // Set the selected date
                  }
                }}
              />
            )}

            <Picker
              selectedValue={monthFilter}
              style={styles.picker}
              onValueChange={(itemValue) => setMonthFilter(itemValue)}
            >
              <Picker.Item label="Select Month" value={undefined} />
              {[...Array(12).keys()].map((i) => (
                <Picker.Item key={i} label={`Month ${i + 1}`} value={i + 1} />
              ))}
            </Picker>

            <Picker
              selectedValue={yearFilter}
              style={styles.picker}
              onValueChange={(itemValue) => setYearFilter(itemValue)}
            >
              <Picker.Item label="Select Year" value={undefined} />
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                <Picker.Item key={year} label={`${year}`} value={year} />
              ))}
            </Picker>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
                <Text style={styles.buttonText}>Apply</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
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
  joinButton: {
    backgroundColor: '#00CED1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  joinText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    color: '#666',
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
  dateButton: {
    backgroundColor: '#00CED1', // Primary color for better visibility
    paddingVertical: 12, // Increased padding for a better size
    borderRadius: 5,
    marginBottom: 10,
    elevation: 2, // Add elevation for shadow effect
    alignItems: 'center', // Center the text
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 16, // Increased font size for better readability
    fontWeight: 'bold', // Make the text bold
    textAlign: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: '#00CED1', // Green for apply action
    paddingVertical: 12, // Increased padding for a better size
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    elevation: 2, // Add elevation for shadow effect
  },
  resetButton: {
    backgroundColor: '#DC3545', // Red for reset action
    paddingVertical: 12, // Increased padding for a better size
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    elevation: 2, // Add elevation for shadow effect
  },
  closeButton: {
    backgroundColor: '#6C757D', // Grey for close action
    paddingVertical: 12, // Increased padding for a better size
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    elevation: 2, // Add elevation for shadow effect
  },
  buttonText: {
    color: '#fff',
    fontSize: 16, // Increased font size for better readability
    fontWeight: 'bold', // Make the text bold
    textAlign: 'center',
  },
}); 