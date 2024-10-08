import { View, Text, FlatList, TouchableOpacity, Alert, Modal, Pressable, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'; // Import SimpleLineIcons
import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../config/FireBaseConfig'; // Import your Firestore config

interface Reminder {
  id: string;
  vaccine: string;
  date: string;
  description: string;
  vaccineId: string; // Include vaccineId
}

const Reminders = ({ loggedChildId }: { loggedChildId: string }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false); // State to toggle reschedule view
  const [rescheduleReason, setRescheduleReason] = useState(''); // State to hold the reschedule reason

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      // Query the VaccinationSessions collection where the selectedParticipants array contains the loggedChildId
      const vaccinationSessionsQuery = query(
        collection(db, 'VaccinationSessions'),
        where('selectedParticipants', 'array-contains', 'child_4')
      );
      const querySnapshot = await getDocs(vaccinationSessionsQuery);

      const fetchedReminders: Reminder[] = [];

      // Loop through each VaccinationSession document
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();

        // Fetch the corresponding vaccine name from VaccinationSchedules collection using selectedVaccine ID
        const vaccineDocRef = doc(db, 'VaccinationSchedules', data.selectedVaccine);
        const vaccineDocSnapshot = await getDoc(vaccineDocRef);

        let vaccineName = 'Unknown Vaccine';
        if (vaccineDocSnapshot.exists()) {
          vaccineName = vaccineDocSnapshot.data().vaccineName; // Assuming 'vaccineName' is the field in VaccinationSchedules
        }

        // Prepare the reminder object
        const reminder: Reminder = {
          id: docSnapshot.id,
          vaccine: vaccineName, // Use the real vaccine name
          date: new Date(data.date.seconds * 1000).toLocaleDateString(), // Convert Firestore timestamp to readable date
          description: `Vaccination at ${data.selectedCenter}, ${data.selectedArea} starting from ${new Date(data.startTime.seconds * 1000).toLocaleTimeString()} to ${new Date(data.endTime.seconds * 1000).toLocaleTimeString()}`,
          vaccineId: data.selectedVaccine, // Store the vaccineId for reference
        };
        fetchedReminders.push(reminder);
      }

      setReminders(fetchedReminders);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch reminders.');
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipatingPress = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setModalVisible(true);
    setIsRescheduleMode(false); // Reset mode when opening the modal
  };

  // Function to save the confirmed vaccination record
  const handleConfirmComing = async () => {
    if (!selectedReminder) return;

    const childDocRef = doc(db, "Users", "2DaIkDN1VUuNGk199UBJ", "Childrens", 'child_4', "VaccinationRecords", selectedReminder.id);

    const newVaccinationRecord = {
      administeredDate: null,
      scheduledDate: selectedReminder.date,
      sideEffects: [],
      status: "Scheduled",
      rescheduleReason: null,
      vaccineId: selectedReminder.vaccineId,
      vaccineName: selectedReminder.vaccine,
      vaccinationSessionId: selectedReminder.id, // Store the session ID for reference
    };

    try {
      // Save to Firestore
      await setDoc(childDocRef, newVaccinationRecord);
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

  // Function to save the rescheduled vaccination record
  const handleSubmitReschedule = async () => {
    if (!selectedReminder || rescheduleReason.trim() === '') {
      Alert.alert('Error', 'Please provide a reason for rescheduling.');
      return;
    }

    const childDocRef = doc(db, "Users", "2DaIkDN1VUuNGk199UBJ", "Childrens", 'child_4', "VaccinationRecords", selectedReminder.id);

    const rescheduledVaccinationRecord = {
      administeredDate: null,
      scheduledDate: selectedReminder.date, // From the vaccination session
      sideEffects: [],
      status: "Rescheduled", // Updated status
      rescheduleReason: rescheduleReason, // Fill with the typed reason
      vaccineId: selectedReminder.vaccineId,
      vaccineName: selectedReminder.vaccine,
      vaccinationSessionId: selectedReminder.id, // Store the session ID for reference
    };

    try {
      // Save to Firestore
      await setDoc(childDocRef, rescheduledVaccinationRecord);
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
      {/* Reminders Section */}
      <Text className="text-lg font-semibold mb-2">Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-blue-200 rounded-lg p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-semibold">
                Vaccine - <Text className="font-bold">{item.vaccine}</Text>
              </Text>
              <Ionicons name="notifications" size={24} color="black" />
            </View>
            <Text className="text-gray-600">{item.description}</Text>
            <View className="flex-row justify-between items-center mt-4">
              <Text className="text-sm text-gray-500">{item.date}</Text>
              <TouchableOpacity className="bg-gray-800 p-2 rounded-lg" onPress={() => handleParticipatingPress(item)}>
                <Text className="text-white text-xs">Participating</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Bottom-Sheet Style Modal for Confirm/Reschedule */}
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
                height: '66%', // Cover 2/3 of the screen
                alignItems: 'center',
                backgroundColor: 'white',
                borderTopLeftRadius: 60,
                borderTopRightRadius: 60,
                padding: 20,
              }}
            >
              {/* Close Icon in the Top-Left */}
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
                  <Text className="text-lg font-bold mb-4">What would you like to do?</Text>
                  <Text className="text-md mb-6">Vaccine: {selectedReminder.vaccine}</Text>
                  <View className="flex-row w-4/5 justify-between">
                    <Pressable
                      className="bg-green-500 p-3 rounded-lg"
                      onPress={handleConfirmComing}
                    >
                      <Text className="text-white">Confirm Coming</Text>
                    </Pressable>
                    <Pressable
                      className="bg-yellow-500 p-3 rounded-lg"
                      onPress={handleReschedule}
                    >
                      <Text className="text-white">Reschedule</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
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
                  <Pressable
                    className="bg-blue-500 p-3 rounded-lg mt-4"
                    onPress={handleSubmitReschedule}
                  >
                    <Text className="text-white">Submit Reason</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default Reminders;
