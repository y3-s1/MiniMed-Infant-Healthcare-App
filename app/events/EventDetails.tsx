import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, TextInput, FlatList, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/FireBaseConfig';
import { UserContext } from '../../contexts/userContext'; 
import { useNavigation } from '@react-navigation/native'; // Import useNavigation


// Define an interface for the Event Data
interface EventData {
  EventImage: string;
  EventTitle: string;
  EventDate: string;
  EventStartTime: string;
  EventEndTime: string;
  EventDescription: string;
  EventOrganizer: string; // This will hold the ID of the Midwife
  EventLocation: string;
  EventJoinedPeople?: string[]; // Optional, as it may not be present
}

interface OrganizerData {
  name: string;
  phone: string;
}

interface UserData {
  id: string; // Ensure ID is part of UserData
  name: string;
  email: string;
}

export default function EventDetails() {

  const navigation = useNavigation();

  const { id } = useLocalSearchParams(); // Get event ID from route params
  const [eventData, setEventData] = useState<EventData | null>(null); // Store event data
  const [organizerData, setOrganizerData] = useState<OrganizerData | null>(null); // Store organizer data
  const [loading, setLoading] = useState(true); // Loading state
  const [feedbackList, setFeedbackList] = useState<any[]>([]); // Initialize as empty array for actual feedback data
  const [newFeedback, setNewFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendeesList, setAttendeesList] = useState<UserData[]>([]);
  const { user } = useContext(UserContext) || {}; // Ensure user is an empty object if context is null

  // Define the makeCall function
  const makeCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`; // Use backticks for string interpolation
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          console.log('Phone number is not supported');
        }
      })
      .catch((error) => {
        console.error("Error making call:", error);
      });
  };

  useEffect(() => {


    navigation.setOptions({ title: 'Event Details' });
    const fetchEventData = async () => {
      try {
        const eventId = Array.isArray(id) ? id[0] : id; // Ensure 'id' is a string, not an array
        if (!eventId) {
          console.error('Event ID is missing');
          return;
        }

        // Fetch event details from Firestore
        const eventDocRef = doc(db, 'Events', eventId);
        const eventDoc = await getDoc(eventDocRef);

        if (eventDoc.exists()) {
          const eventData = eventDoc.data() as EventData;
          setEventData(eventData); // Store event data

          // Fetch organizer data
          const organizerDocRef = doc(db, 'Midwives', eventData.EventOrganizer);
          const organizerDoc = await getDoc(organizerDocRef);
          if (organizerDoc.exists()) {
            const organizerInfo = organizerDoc.data() as OrganizerData;
            setOrganizerData(organizerInfo);
          } else {
            console.error("Organizer not found");
          }

          // Fetch attendees' data if any
          if (Array.isArray(eventData.EventJoinedPeople) && eventData.EventJoinedPeople.length > 0) {
            const usersRef = collection(db, 'Users');
            const usersSnapshot = await getDocs(usersRef);
            const allUsers = usersSnapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name,
              email: doc.data().email,
            })) as UserData[];

            const attendees = allUsers.filter(user => eventData.EventJoinedPeople?.includes(user.id)); // Filter attendees
            setAttendeesList(attendees);
          }

          // Fetch event feedback data
          const feedbackRef = collection(db, 'Events', eventId, 'EventFeedback');
          const feedbackSnapshot = await getDocs(feedbackRef);

          const feedbackData = await Promise.all(
            feedbackSnapshot.docs.map(async (feedbackDoc) => {
              const feedback = feedbackDoc.data();
              const userDocRef = doc(db, 'Users', feedback.UserId);
              const userDoc = await getDoc(userDocRef);
              const userData = userDoc.exists() ? userDoc.data() : { name: 'Unknown User' };
              return {
                id: feedbackDoc.id,
                text: feedback.Comment,
                likes: feedback.Like ? 1 : 0,
                userImage: 'https://via.placeholder.com/40', // Placeholder for user image
                userName: userData?.name || 'Unknown User',
              };
            })
          );
          setFeedbackList(feedbackData); // Update feedback list with actual data

        } else {
          console.error("Event not found");
        }
      } catch (error) {
        console.error("Error fetching event details and feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleFeedbackSubmit = async () => {
    if (newFeedback.trim() !== '' && user && user.uid) { // Check if user is logged in
      const feedbackData = {
        Comment: newFeedback,
        Like: false,
        UserId: user.uid, // Use user's UID
      };

      // Store feedback in Firestore
      try {
        const feedbackCollectionRef = collection(db, 'Events', id as string, 'EventFeedback'); // Path to EventFeedback collection
        await addDoc(feedbackCollectionRef, feedbackData); // Add the feedback document

        // Update local feedback list
        setFeedbackList([...feedbackList, { id: feedbackList.length + 1, text: newFeedback, userImage: 'https://via.placeholder.com/40', likes: 0, userName: user.name }]);
        setNewFeedback('');
        setShowFeedbackModal(false);
      } catch (error) {
        console.error("Error submitting feedback:", error);
      }
    }
  };

  const renderAttendee = ({ item }: { item: UserData }) => (
    <View style={styles.attendeeRow}>
      <Text style={styles.attendeeName}>{item.name}</Text>
      <Text style={styles.attendeeEmail}>{item.email}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A8E1" />
        <Text>Loading Event Details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Event Details Section */}
      <View style={styles.eventInfoContainer}>
        {/* <Image
          source={{ uri: eventData?.EventImage || 'https://via.placeholder.com/100' }} // Use fallback image if not present
          style={styles.eventImage}
        /> */}
    
        {/* Event Date and Time */}
        <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{eventData?.EventTitle || 'Event Title'}</Text>

          <Text style={styles.eventDate}>
            <Text style={styles.eventDatelabel}>Date: </Text> 
            {eventData?.EventDate || 'Event Date'}
          </Text>
          <Text style={styles.eventTime}>
          <Text style={styles.eventTimelabel}>Start: </Text>  {eventData?.EventStartTime} <Text style={styles.eventTimelabel}> - End: </Text>  {eventData?.EventEndTime}
          </Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.sectionContent}>{eventData?.EventDescription || 'Event description goes here.'}</Text>
      </View>

      {/* Organized By Section */}
      <View style={styles.organizedBySection}>
        <Text style={styles.sectionTitle}>Organized By</Text>
        <View style={styles.organizerContainer}>
          <View style={styles.organizerInfo}>
            <Text style={styles.organizerName}>{organizerData?.name || 'Organizer Name'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.organizerPhone}>{organizerData?.phone || 'Phone Number'}</Text>
              <TouchableOpacity onPress={() => organizerData?.phone && makeCall(organizerData.phone)}>
                <Ionicons name="call-outline" size={20} color="#60a5fa" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Location Section */}
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        {/* <Image
          source={{ uri: 'https://via.placeholder.com/300x200' }} // Placeholder for map image
          style={styles.mapImage}
        /> */}
        <Text style={styles.locationAddress}>{eventData?.EventLocation || 'Event Location'}</Text>
      </View>

        {/* Attendees Section */}
      <View style={styles.attendeesSection}>
        <Text style={styles.sectionTitle}>Attendees</Text>
        <TouchableOpacity onPress={() => setShowAttendeesModal(true)}>
          <Text style={styles.viewAttendeesButton}>View Attendees ({attendeesList.length})</Text>
        </TouchableOpacity>
      </View>
      {/* Feedback Section       */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Feedback & Ratings</Text>
        <FlatList
          data={feedbackList}
          renderItem={({ item }) => (
            <View style={styles.feedbackContainer}>
              <Image source={{ uri: item.userImage }} style={styles.userImage} />
              <View style={styles.feedbackContent}>
                <Text style={styles.feedbackUserName}>{item.userName}</Text>
                <Text style={styles.feedbackText}>{item.text}</Text>                        
                
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity style={styles.addFeedbackButton} onPress={() => setShowFeedbackModal(true)}>
          <Text style={styles.addFeedbackButtonText}>Add Feedback</Text>
        </TouchableOpacity>
      </View>


      
          {/* Attendees Modal */}
      <Modal visible={showAttendeesModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Attendees</Text>
            <FlatList
              data={attendeesList}
              renderItem={renderAttendee}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity onPress={() => setShowAttendeesModal(false)}>
              <Text style={styles.closeModalButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Your Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback here..."
              value={newFeedback}
              onChangeText={setNewFeedback}
            />
            <TouchableOpacity style={styles.submitFeedbackButton} onPress={handleFeedbackSubmit}>
              <Text style={styles.submitFeedbackButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
              <Text style={styles.closeModalButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Styles for the component
  // container: {
  //   flex: 1,
  //   padding: 16,
  //   backgroundColor: '#fff',
  // },
  // loadingContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // eventInfoContainer: {
  //   // flexDirection: 'row',
  //   alignItems: 'center',
  //   marginBottom: 20,
  // },
  // eventImage: {
  //   width: 100,
  //   height: 100,
  //   borderRadius: 10,
  //   marginRight: 16,
  // },
  // eventInfo: {
  //   // flex: 1,
  //   alignItems: 'center',
  // },
  // eventTitle: {
  //   fontSize: 24,
  //   fontWeight: 'bold',
  // },
  // eventDate: {
  //   fontSize: 16,
  //   color: '#666',
  //   marginBottom: 5, // Add some spacing between date and time
  // },
  // eventTime: {
  //   fontSize: 16,
  //   color: '#666',
  // },

  
  // aboutSection: {
  //   marginBottom: 20,
  // },
  // sectionTitle: {
  //   fontSize: 20,
  //   fontWeight: 'bold',
  //   marginBottom: 10,
  // },
  // sectionContent: {
  //   fontSize: 16,
  //   color: '#333',
  // },
  // organizedBySection: {
  //   marginBottom: 20,
  // },
  // organizerContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // organizerInfo: {
  //   flex: 1,
  // },
  // organizerName: {
  //   fontSize: 18,
  //   // fontWeight: 'bold',
  // },
  // organizerPhone: {
  //   fontSize: 16,
  //   // color: '#00A8E1',
  //   color: '#60a5fa',  
  // },
  // locationSection: {
  //   marginBottom: 20,
  // },
  // mapImage: {
  //   width: '100%',
  //   height: 200,
  //   borderRadius: 10,
  // },

  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfoContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  eventInfo: {
    // flex: 1,
    // justifyContent: 'center',
    alignItems: 'center', // Align the date and time to the center
    marginBottom: 20, // Space between rows
  },
  eventTitle: {
    // fontSize: 18,
    // fontWeight: 'bold',
    fontSize: 18, // Larger font size for title
    fontWeight: 'bold', // Bold for emphasis
    textAlign: 'center', // Center the title
    marginBottom: 10, // Space below the title
    color: '#333', 
  },
  eventDate: {
    // fontSize: 14,
    // color: '#555',
    fontWeight: 'bold', 
    fontSize: 14, // Medium font size for date label
    color: '#60a5fa',  // Slightly lighter for normal text
    marginBottom: 5, 
  },
  eventDatelabel: {
    // fontSize: 14,
    // color: '#555',
    fontSize: 16, // Medium font size for date label
    fontWeight: 'bold', // Bold for the "Date" label
    color: '#333', // Slightly lighter for normal text
    marginBottom: 5, 
  },

  
  eventTime: {
    fontSize: 14,
    fontWeight: 'bold', 
    color: '#60a5fa', 
  },
  eventTimelabel: {
    fontSize: 14,
    fontWeight: 'bold', 
    color: '#333', 
  },
  aboutSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#333',
  },
  organizedBySection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  organizerPhone: {
    fontSize: 14,
    color: '#60a5fa', 
  },
  locationSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  locationMap: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationAddress: {
    fontSize: 14,
    color: '#333',
  },

  // feedbackSection: {
  //   marginBottom: 20,
  // },
  // feedbackContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'flex-start',
  //   marginBottom: 10,
  // },
  // userImage: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   marginRight: 10,
  // },
  // feedbackContent: {
  //   flex: 1,
  // },
  // feedbackUserName: {
  //   fontWeight: 'bold',
  // },
  // feedbackText: {
  //   marginTop: 5,
  //   fontSize: 16,
  //   color: '#333',
  // },
  // feedbackLikes: {
  //   fontSize: 14,
  //   color: '#666',
  //   marginLeft: 10,
  // },





  addFeedbackButton: {
    marginTop: 10,
    // backgroundColor: '#00A8E1',
    backgroundColor: '#60a5fa',  
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addFeedbackButtonText: {
    color: '#fff',
    fontSize: 16,
  },



  attendeesSection: {
    // marginBottom: 20,

    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  viewAttendeesButton: {
    fontSize: 16,
    // color: '#00A8E1',
    color: '#60a5fa',  
    
  },


  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },


  feedbackInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  submitFeedbackButton: {
    // backgroundColor: '#00A8E1',
    backgroundColor: '#60a5fa',  
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitFeedbackButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeModalButton: {
    // color: '#00A8E1',
    color: '#60a5fa',  
    marginTop: 10,
  },
  attendeeRow: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendeeEmail: {
    fontSize: 14,
    color: '#666',
  },

  locationAddress: { // Added missing style for location address
    fontSize: 16,
    color: '#333',
    // textAlign: 'center',
    marginTop: 8,
  },










  feedbackSection: {
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  
  feedbackContent: {
    flex: 1,
    paddingRight: 10,
  },
  
  feedbackUserName: {
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 2,
  },
  
  feedbackText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 5,
  },
  
  feedbackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  likeButton: {
    backgroundColor: '#00A8E1',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  
  likeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  feedbackLikes: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 10,
  },
  



});
