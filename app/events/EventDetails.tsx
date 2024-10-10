import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, ActivityIndicator, TextInput, FlatList, Linking  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FireBaseConfig';

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
  const { id } = useLocalSearchParams(); // Get event ID from route params
  const [eventData, setEventData] = useState<EventData | null>(null); // Store event data
  const [organizerData, setOrganizerData] = useState<OrganizerData | null>(null); // Store organizer data
  const [loading, setLoading] = useState(true); // Loading state
  const [feedbackList, setFeedbackList] = useState([
    { id: 1, text: "Great workshop! Learned a lot.", userImage: 'https://via.placeholder.com/40', likes: 5 },
    { id: 2, text: "Very informative. Thanks!", userImage: 'https://via.placeholder.com/40', likes: 2 },
  ]);
  const [newFeedback, setNewFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendeesList, setAttendeesList] = useState<UserData[]>([]);




   // Define the makeCall function
   const makeCall = (phoneNumber: string) => {
    const phoneUrl = `tel:${phoneNumber}`;
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

  // Fetch event details from Firestore
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventDocRef = doc(db, 'Events', id);
        const eventDoc = await getDoc(eventDocRef);

        if (eventDoc.exists()) {
          const eventData = eventDoc.data() as EventData;
          setEventData(eventData); // Store event data

          // Fetch organizer data
          const organizerDocRef = doc(db, 'Midwives', eventData.EventOrganizer); // Get the organizer using the ID
          const organizerDoc = await getDoc(organizerDocRef);
          if (organizerDoc.exists()) {
            const organizerInfo = organizerDoc.data() as OrganizerData; // Get the organizer data
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

            // Filter users based on EventJoinedPeople array
            const attendees = allUsers.filter(user => eventData.EventJoinedPeople?.includes(user.id)); // Use optional chaining here
            setAttendeesList(attendees);
            // console.log(attendees);
          }
        } else {
          console.error("Event not found");
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const handleFeedbackSubmit = () => {
    if (newFeedback.trim() !== '') {
      setFeedbackList([...feedbackList, { id: feedbackList.length + 1, text: newFeedback, userImage: 'https://via.placeholder.com/40', likes: 0 }]);
      setNewFeedback('');
      setShowFeedbackModal(false);
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
        <Image
          source={{ uri: eventData?.EventImage || 'https://via.placeholder.com/100' }} // Use fallback image if not present
          style={styles.eventImage}
        />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{eventData?.EventTitle || 'Event Title'}</Text>
          <Text style={styles.eventDate}>{eventData?.EventDate || 'Event Date'}</Text>
          <Text style={styles.eventTime}>
            {eventData?.EventStartTime} - {eventData?.EventEndTime}
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
          <Image
            source={{ uri: 'https://via.placeholder.com/50' }} // Placeholder for organizer image
            style={styles.organizerImage}
          />
          <View style={styles.organizerInfo}>
            <Text style={styles.organizerName}>{organizerData?.name || 'Organizer Name'}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.organizerPhone}>{organizerData?.phone || 'Phone Number'}</Text>
              <TouchableOpacity onPress={() => organizerData?.phone && makeCall(organizerData.phone)}>
                <Ionicons name="call-outline" size={20} color="#00A8E1" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>


      {/* Location Section */}
      <View style={styles.locationSection}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Image
          source={{ uri: 'https://via.placeholder.com/400x200' }} // Placeholder for map image
          style={styles.locationMap}
        />
        <Text style={styles.locationAddress}>{eventData?.EventLocation || 'Event Location'}</Text>
      </View>

      {/* People Attending Section */}
      <View style={styles.peopleAttendingSection}>
        <Text style={styles.sectionTitle}>People attending ({eventData?.EventJoinedPeople?.length || 0})</Text>
        <TouchableOpacity style={styles.seeAllButton} onPress={() => setShowAttendeesModal(true)}>
          <Text style={styles.seeAllButtonText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback Section */}
      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Feedback and Ratings</Text>

        <ScrollView style={styles.feedbackContainer} nestedScrollEnabled={true}>
          {feedbackList.map(feedback => (
            <View key={feedback.id} style={styles.feedbackItem}>
              <Image source={{ uri: feedback.userImage }} style={styles.feedbackUserImage} />
              <View style={styles.feedbackTextContainer}>
                <Text style={styles.feedbackText}>{feedback.text}</Text>
                <View style={styles.feedbackActions}>
                  <TouchableOpacity>
                    <Ionicons name="heart-outline" size={20} color="#00A8E1" />
                  </TouchableOpacity>
                  <Text style={styles.likesCount}>{feedback.likes}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.addFeedbackButton} onPress={() => setShowFeedbackModal(true)}>
          <Text style={styles.addFeedbackButtonText}>Add Feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for Feedback */}
      <Modal
        visible={showFeedbackModal}
        transparent={true} // Set transparent to true
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Write your feedback..."
              multiline
              value={newFeedback}
              onChangeText={setNewFeedback}
            />
            <View style={styles.feedbackFormActions}>
              <TouchableOpacity style={styles.submitButton} onPress={handleFeedbackSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFeedbackModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for Attendees */}
      <Modal
        visible={showAttendeesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAttendeesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={attendeesList}
              keyExtractor={(item) => item.id} // Use 'id' as key
              renderItem={renderAttendee}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAttendeesModal(false)}>
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
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
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
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
    color: '#555',
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
  peopleAttendingSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  seeAllButton: {
    backgroundColor: '#00A8E1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  seeAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackSection: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  feedbackContainer: {
    maxHeight: 150,
  },
  feedbackItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  feedbackUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
  },
  feedbackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#555',
  },
  addFeedbackButton: {
    backgroundColor: '#00A8E1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addFeedbackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Make background semi-transparent
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    width: '90%', // Set width to control the size of the modal
  },
  feedbackInput: {
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
  },
  feedbackFormActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#00A8E1',
    padding: 10,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  attendeesModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  attendeesList: {
    flex: 1,
  },
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  attendeeName: {
    fontSize: 16,
  },
  attendeeEmail: {
    fontSize: 14,
    color: '#555',
  },
  closeButton: {
    backgroundColor: '#00A8E1',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});