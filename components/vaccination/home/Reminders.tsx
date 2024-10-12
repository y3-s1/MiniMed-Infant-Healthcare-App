import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, Modal, Pressable, TextInput } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'; // Import SimpleLineIcons
import { collection, getDocs, query, where, doc, getDoc, setDoc, addDoc, collectionGroup } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig'; // Import your Firestore config
import { UserContext } from '@/contexts/userContext';
import { useNavigation } from 'expo-router';
import { registerForPushNotificationsAsync, setupNotificationListeners } from '@/services/notificationService'; // Adjust the import path accordingly
import { cancelScheduledNotificationAsync, scheduleNotificationAsync } from 'expo-notifications';

interface Reminder {
  id: string;
  vaccine: string;
  date: string;
  description: string;
  vaccineId: string; // Include vaccineId
  location: string;
  isNotificationEnabled: boolean; // Track notification status
}

const Reminders = ({ loggedChildId }: { loggedChildId: string }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false); // State to toggle reschedule view
  const [rescheduleReason, setRescheduleReason] = useState(''); // State to hold the reschedule reason

  const navigation = useNavigation();
  const { user, selectedChildId } = useContext(UserContext);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Reminders',
      headerStyle: {
        backgroundColor: '#3b82f6', // Set the header background color
      },
      headerTintColor: '#fff', // Set the back arrow and title color
    });


    fetchReminders();
    //requestNotificationPermissions(); // Request notification permissions on component mount
    setupNotificationListeners();
  }, [selectedChildId]);

  // Function to request notification permissions
  // const requestNotificationPermissions = async () => {
  //   const { status } = await Notifications.requestPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Permission Denied', 'You need to grant notification permissions to use this feature.');
  //   }
  // };

  // // Function to schedule a notification
  // const scheduleNotification = async (title: string, body: string, date: Date) => {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title,
  //       body,
  //     },
  //     trigger: date, // Schedule the notification at the given date
  //   });
  // };

  const fetchReminders = async () => {
    try {
      const vaccinationSessionsQuery = query(
        collectionGroup(db, 'VaccinationSessions'),
        where('selectedParticipants', 'array-contains', selectedChildId)
      );
      const querySnapshot = await getDocs(vaccinationSessionsQuery);

      const fetchedReminders: Reminder[] = [];

      // Loop through each VaccinationSession document
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        if (data.status === 'complete') {
          continue; // Skip completed sessions
        }

        const vaccinationRecordsQuery = query(
          collection(db, 'VaccinationRecords'),
          where('vaccinationSessionId', '==', docSnapshot.id),
          where('childId', '==', selectedChildId)
        );

        const vaccinationRecordsSnapshot = await getDocs(vaccinationRecordsQuery);

        if (!vaccinationRecordsSnapshot.empty) {
          continue; // Skip sessions with existing records
        }

        const vaccineDocRef = doc(db, 'VaccinationSchedules', data.selectedVaccine);
        const vaccineDocSnapshot = await getDoc(vaccineDocRef);

        let vaccineName = 'Unknown Vaccine';
        if (vaccineDocSnapshot.exists()) {
          vaccineName = vaccineDocSnapshot.data().vaccineName;
        }

        const reminder: Reminder = {
          id: docSnapshot.id,
          vaccine: vaccineName,
          date: new Date(data.date.seconds * 1000).toLocaleDateString(),
          description: `Vaccination at ${data.selectedCenter},${data.selectedArea} starting from ${new Date(data.startTime.seconds * 1000).toLocaleTimeString()} to ${new Date(data.endTime.seconds * 1000).toLocaleTimeString()}`,
          vaccineId: data.selectedVaccine,
          location: data.selectedCenter,
          isNotificationEnabled: false 
        };

        fetchedReminders.push(reminder);

        // Schedule a notification 1 day before the reminder date
        // const notificationDate = new Date(data.date.seconds * 1000);
        // notificationDate.setDate(notificationDate.getDate() - 1);
        // scheduleNotification(
        //   `Vaccination Reminder for ${vaccineName},
        //   Your child's vaccination is scheduled at ${data.selectedCenter} on ${new Date(data.date.seconds * 1000).toLocaleDateString()}.,
        //   notificationDate`
        // );
      }

      setReminders(fetchedReminders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reminders.');
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };


  const toggleReminderNotification = async (reminder: Reminder) => {
    const updatedReminders = reminders.map((item) => {
      if (item.id === reminder.id) {
        // Toggle notification status
        item.isNotificationEnabled = !item.isNotificationEnabled;

        if (item.isNotificationEnabled) {
          // Schedule a notification
          const notificationDate = new Date(reminder.date); // Convert to the proper date format if necessary
          notificationDate.setDate(notificationDate.getDate() - 1); // Set to trigger 1 day before the event
          scheduleNotificationAsync({
            content: {
              title: 'Reminder!',
              body: 'This is your scheduled reminder!',
              sound: 'default',
            },
            trigger: {
              seconds: 10,  // Notification will trigger after 10 seconds
            },
          });
          console.log('reminder anable')
        } else {
          // Cancel notification
          cancelScheduledNotificationAsync(reminder.id);
        }
      }
      return item;
    });

    setReminders(updatedReminders);
  };



  const handleParticipatingPress = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setModalVisible(true);
    setIsRescheduleMode(false); // Reset mode when opening the modal
  };

  const handleConfirmComing = async () => {
    if (!selectedReminder) return;
  
    // Create a reference to the main VaccinationRecords collection
    const vaccinationRecordsCollectionRef = collection(db, "VaccinationRecords");
  
    const newVaccinationRecord = {
      UserId: user.uid, // Replace with dynamic User ID if available
      childId: selectedChildId, // Replace with dynamic Child ID if available
      administeredDate: null,
      scheduledDate: selectedReminder.date,
      sideEffects: [],
      status: "Scheduled",
      rescheduleReason: null,
      vaccineId: selectedReminder.vaccineId,
      vaccineName: selectedReminder.vaccine,
      vaccinationSessionId: selectedReminder.id, // Store the session ID for reference
      location: selectedReminder.location
    };
  
    try {
      // Add a new document with an auto-generated ID in the VaccinationRecords collection
      await addDoc(vaccinationRecordsCollectionRef, newVaccinationRecord);
      setModalVisible(false);
      Alert.alert('Confirmed', 'You have confirmed your attendance.');
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm attendance.');
      console.error('Error saving vaccination record:', error);
    }
  };

  const handleReschedule = () => {
    setIsRescheduleMode(true); // Switch to reschedule mode
  };

  const handleSubmitReschedule = async () => {
    if (!selectedReminder || rescheduleReason.trim() === '') {
      Alert.alert('Error', 'Please provide a reason for rescheduling.');
      return;
    }

    // Create a reference to the main VaccinationRecords collection
    const vaccinationRecordsCollectionRef = collection(db, "VaccinationRecords");

    const rescheduledVaccinationRecord = {
      UserId: user.uid, // Replace with dynamic User ID if available
      childId: selectedChildId, // Replace with dynamic Child ID if available
      administeredDate: null,
      scheduledDate: selectedReminder.date, // From the vaccination session
      sideEffects: [],
      status: "Rescheduled", // Updated status
      rescheduleReason: rescheduleReason, // Fill with the typed reason
      vaccineId: selectedReminder.vaccineId,
      vaccineName: selectedReminder.vaccine,
      vaccinationSessionId: selectedReminder.id, // Store the session ID for reference
      location: selectedReminder.location,
    };

    try {
      // Add a new document with an auto-generated ID in the VaccinationRecords collection
      await addDoc(vaccinationRecordsCollectionRef, rescheduledVaccinationRecord);
      setModalVisible(false);
      setRescheduleReason(''); // Reset the reason after submission
      Alert.alert('Reschedule Submitted', 'You have submitted a reschedule request.');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit reschedule.');
      console.error('Error saving rescheduled record:', error);
    }
  };

  if (loading) {
    return <Text>Loading reminders...</Text>;
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.shadow} className="bg-white shadow-xl  rounded-lg p-4 m-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold">
                Vaccine - <Text className="font-bold">{item.vaccine}</Text>
              </Text>
              <Ionicons
                name={item.isNotificationEnabled ? "notifications" : "notifications-off"} // Change icon based on status
                size={24}
                color={item.isNotificationEnabled ? "blue" : "gray"} // Change color based on status
                onPress={() => toggleReminderNotification(item)} // Handle toggle press
              />
            </View>
            <Text className="text-gray-600 text-base">{item.description}</Text>
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-base text-gray-700">{item.date}</Text>
              <TouchableOpacity className="bg-blue-800 p-2 rounded-lg" onPress={() => handleParticipatingPress(item)}>
                <Text className="text-white text-base">Participating</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {selectedReminder && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end">
            <View
              style={{
                height: '100%',
                justifyContent: 'center',
                alignItems: 'baseline',
                backgroundColor: 'white',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 20,
              }}
            >
              <Pressable
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                }}
                onPress={() => setModalVisible(false)}
              >
                <SimpleLineIcons name="close" size={24} color="black" />
              </Pressable>

              {!isRescheduleMode ? (
                <>
                <View className='m-auto'>
                  <Text className="text-xl font-bold mb-4">What would you like to do?</Text>
                  <Text className="text-lg mb-6">Vaccine: {selectedReminder.vaccine}</Text>
                  <View className="flex-row w-4/5 justify-between">
                    <Pressable className="bg-green-500 p-3 rounded-lg" onPress={handleConfirmComing}>
                      <Text className="text-white">Confirm Coming</Text>
                    </Pressable>
                    <Pressable className="bg-yellow-500 p-3 rounded-lg" onPress={handleReschedule}>
                      <Text className="text-white">Reschedule</Text>
                    </Pressable>
                  </View>
                  </View>
                </>
              ) : (
                <>
                <View className='m-auto w-4/5'>
                  <Text className="text-lg font-bold mb-4">Reschedule Reason</Text>
                  <TextInput
                    value={rescheduleReason}
                    onChangeText={setRescheduleReason}
                    placeholder="Enter your reason for rescheduling"
                    multiline
                    style={{
                      width: '90%',
                      height: 100,
                      borderColor: 'gray',
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 10,
                      textAlignVertical: 'top',
                    }}
                  />
                  <Pressable className="bg-blue-500 p-3 rounded-lg mt-4 mr-36" onPress={handleSubmitReschedule}>
                    <Text className="text-white">Submit Reason</Text>
                  </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  }
});

export default Reminders;