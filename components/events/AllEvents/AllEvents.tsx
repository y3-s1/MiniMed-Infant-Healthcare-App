import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList, Modal } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { db } from '../../../config/FireBaseConfig'; // Import Firestore instance
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import SearchBar from '../SearchBar/SearchBar'; // Import the updated SearchBar
import DateTimePicker from '@react-native-community/datetimepicker'; // Import DateTimePicker
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { router } from 'expo-router';
import { UserContext } from '../../../contexts/userContext'; // Import UserContext

// Define the type for your event object
type Event = {
  id: string;
  EventTitle: string;
  EventImage: string;
  EventDate: string;
  EventStartTime: string; // New field
  EventEndTime: string; // New field
  EventDescription: string; // New field
  EventLocation: string; // New field
  EventJoinedPeople: string[]; // Add this line to include the joined people
  status: 'Upcoming' | 'Ongoing' | 'Completed'; // Add status to the Event type

};

export default function AllEvents() {
  
  const { user } = useContext(UserContext); // Get the logged-in user from context
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
          EventStartTime: data.EventStartTime, // Add this line to fetch EventStartTime
          EventEndTime: data.EventEndTime, // Add this line to fetch EventEndTime
          EventDescription: data.EventDescription, // Add this line to fetch EventDescription
          EventLocation: data.EventLocation, // Add this line to fetch EventLocation
          EventJoinedPeople: data.EventJoinedPeople || [], // Initialize if undefined
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
    const filteredEvents = events.filter(event => {
      const matchesTitle = titleFilter ? event.EventTitle.toLowerCase().includes(titleFilter.toLowerCase()) : true;
      const eventDateObj = new Date(event.EventDate);

      const matchesDate = dateFilter ? eventDateObj.toDateString() === dateFilter?.toDateString() : true;
      const matchesMonth = monthFilter !== undefined ? eventDateObj.getMonth() === monthFilter - 1 : true; // Correct month logic
      const matchesYear = yearFilter !== undefined ? eventDateObj.getFullYear() === yearFilter : true;

      return matchesTitle && matchesDate && matchesMonth && matchesYear;
    });
    setEvents(filteredEvents);
    setFilterVisible(false);
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

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      alert('You must be logged in to join an event.'); // Notify if the user is not logged in
      return;
    }

    const eventRef = doc(db, 'Events', eventId);
    try {
      await updateDoc(eventRef, {
        EventJoinedPeople: [...events.find(event => event.id === eventId)?.EventJoinedPeople || [], user.uid],
      });
      alert('Successfully joined the event!'); // Notify user of success
    } catch (error) {
      console.error("Error joining event: ", error);
      alert('Failed to join the event.'); // Notify user of failure
    }
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => router.push(`/events/EventDetails?id=${item.id}`)}>
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.EventTitle}</Text>
        {/* <Text style={styles.eventDate}>{item.EventDate}</Text> */}
        <Text style={styles.eventDate}>
          <Text style={styles.boldText}>Date:</Text> <Text style={styles.normalText}>{item.EventDate}</Text>
        </Text>
        <Text style={styles.eventTime}>
          <Text style={styles.boldText}>Start Time:</Text> <Text style={styles.normalText}>{item.EventStartTime}</Text> 
          <Text style={styles.boldText}> | End Time:</Text> <Text style={styles.normalText}>{item.EventEndTime}</Text>
        </Text>
        <Text style={styles.eventLocation}>
          <Text style={styles.boldText}>Location:</Text> <Text style={styles.normalText}>{item.EventLocation}</Text>
        </Text>
        <Text style={styles.eventDescription}>
          <Text style={styles.boldText}>Description:</Text> <Text style={styles.normalText}>{item.EventDescription}</Text>
        </Text>
        <View style={styles.eventFooter}>
          <TouchableOpacity style={styles.joinButton} onPress={() => handleJoinEvent(item.id)}>
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
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

            <Picker selectedValue={monthFilter} style={styles.picker} onValueChange={(itemValue) => setMonthFilter(itemValue)}>
              <Picker.Item label="Select Month" value={undefined} />
              {[...Array(12).keys()].map(i => (
                <Picker.Item key={i} label={`Month ${i + 1}`} value={i + 1} />
              ))}
            </Picker>


            <Picker
              selectedValue={yearFilter}
              style={styles.picker}
              onValueChange={(itemValue) => setYearFilter(itemValue)}
            >
              <Picker.Item label="Select Year" value={undefined} />
              {/* Generate a range of years from 2020 to 2050 */}
              {[...Array(31).keys()].map((i) => {
                const year = 2020 + i; // Start from 2020 and increment up to 2050
                return <Picker.Item key={year} label={`${year}`} value={year} />;
              })}
            </Picker>


            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={applyFilters} style={styles.applyButton}>
                <Text style={styles.buttonText}>Apply Filters</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
                <Text style={styles.buttonText}>Reset Filters</Text>
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
    padding: 20,
    backgroundColor: '#f0f4f8', // Light grey background for a soft look
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20, // Increased padding for better spacing
    marginVertical: 10,
    elevation: 4, // Slightly increased elevation for a better shadow effect
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  eventInfo: {
    marginTop: 10,
  },
  eventTitle: {
    fontSize: 24, // Slightly larger title font size
    fontWeight: 'bold',
    color: '#2c3e50', // Darker color for better readability
    marginBottom: 5,
  },
  eventDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9', // Blue color for the date to make it stand out
    marginVertical: 5,
  },
  eventTime: {
    fontSize: 15,
    
    color: '#34495e',
    marginVertical: 2,
  },
  eventLocation: {
    fontSize: 15,
    color: '#34495e',
    marginVertical: 2,
  },
  eventDescription: {
    fontSize: 15,
    color: '#34495e',
    marginVertical: 5,
    lineHeight: 20, // Improved readability

    
  },

  boldText: {
    fontWeight: 'bold',
    color: '#34495e', // Optional: Adjust color if necessary
  },
  normalText: {
    fontWeight: 'normal',
    color: '#34495e', // Ensure consistency with other text
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align the join button to the right
    alignItems: 'center',
    marginTop: 10,
  },
  joinButton: {
    backgroundColor: '#60a5fa',    
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
  },
  joinText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateButton: {
    // backgroundColor: '#007bff',
    backgroundColor: '#60a5fa',    
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  applyButton: {
    backgroundColor: '#60a5fa',    
    padding: 10,
    borderRadius: 5,
  },
  resetButton: {
    backgroundColor: '#60a5fa',    
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
});
