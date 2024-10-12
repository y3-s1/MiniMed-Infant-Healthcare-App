import { View, Text, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { router } from 'expo-router';

interface SingleAppointmentProps {
  appointmentId: string;
  midwife: string; // This is the midwife's document ID
  date: string;
  location: string;
  time: string;
  status: string;
}

const SingleAppointment: React.FC<SingleAppointmentProps> = ({ appointmentId, midwife, date, location, time, status }) => {
  const [midwifeObj, setMidwifeObj] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMidwifeData = async () => {
      try {
        const midwifeDocRef = doc(db, 'Midwives', midwife); // Reference to the specific midwife document
        const midwifeDoc = await getDoc(midwifeDocRef);

        if (midwifeDoc.exists()) {
          setMidwifeObj(midwifeDoc.data());
        } else {
          console.log('No midwife found with this ID.');
        }
      } catch (error) {
        console.error('Error fetching midwife data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMidwifeData();
  }, [midwife]);

  const calculateExperience = (joinedDate: string) => {
    const currentYear = new Date().getFullYear();
    const joinedYear = new Date(joinedDate).getFullYear();
    return currentYear - joinedYear;
  };

  const handleCancelAppointment = async () => {
    console.log('appointment date : ', date);
    console.log('appointment time : ', time);
    try {
      // Parse the time from 12-hour format to 24-hour format
      const [timeValue, period] = time.split(' ');
      let [hours, minutes] = timeValue.split(':').map(Number);

      if (period === 'PM' && hours < 12) hours += 12; // Convert PM to 24-hour format
      if (period === 'AM' && hours === 12) hours = 0; // Handle 12:00 AM as 00:00

      // Combine date and time into a valid Date object
      const appointmentDateTime = new Date(`${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
      const currentTime = new Date();

      // Calculate the difference in milliseconds
      const timeDifference = appointmentDateTime.getTime() - currentTime.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60); // Convert milliseconds to hours

      console.log('appointmentDateTime : ', appointmentDateTime);
      console.log('currentTime : ', currentTime);

      if (hoursDifference < 24) {
        Alert.alert(
          'Cancellation Error',
          'Appointment is less than 24 hours away. Please contact the midwife directly to cancel.'
        );
        return;
      }

      console.log('appointmentId : ', appointmentId);
      // Update the status of the appointment to "Cancelled" in the database
      const appointmentDocRef = doc(db, 'MidwifeAppointments', appointmentId);
      await updateDoc(appointmentDocRef, { status: 'Cancelled' });

      Alert.alert('Appointment Cancelled', 'Your appointment has been successfully cancelled.');
      router.navigate({
        pathname: '/(tabs)/appointments',
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert('Error', 'Failed to cancel the appointment. Please try again later.');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" className="flex-1 justify-center items-center" />;
  }

  return (
    <View className="flex p-4 bg-white">
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Appointment Details</Text>
        {/* Display the Cancel button only when status is 'Scheduled'*/}
        {status === 'Scheduled' && (
          <TouchableOpacity className="bg-red-500 py-2 px-4 rounded-lg" onPress={handleCancelAppointment}>
            <Text className="text-white font-semibold">Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Appointment Information */}
      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="text-lg font-semibold text-gray-700">Appointment ID: {appointmentId}</Text>
        <Text className="text-lg font-semibold text-gray-700">Date: {date}</Text>
        <Text className="text-lg font-semibold text-gray-700">Time: {time}</Text>
        <Text className="text-lg font-semibold text-gray-700">Location: {location}</Text>
        <Text className="text-lg font-semibold text-gray-700">Status: {status}</Text>
      </View>

      {/* Midwife Information */}
      {midwifeObj ? (
        <View className="bg-white shadow-md p-4 rounded-lg">
          <View className="flex flex-row items-center mb-4">
            <Image source={{ uri: midwifeObj.image }} className="w-24 h-24 rounded-full mr-4" />
            <View>
              <Text className="text-xl font-bold text-gray-800">{midwifeObj.name}</Text>
              <Text className="text-md text-gray-500">Location: {midwifeObj.location}</Text>
              <Text className="text-md text-gray-500">Province: {midwifeObj.province}</Text>
              <Text className="text-md text-gray-500">Phone: {midwifeObj.phone}</Text>
              <Text className="text-md text-gray-500">Experience: {calculateExperience(midwifeObj.joinedDate)} years</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text className="text-gray-500 text-center">No midwife data available.</Text>
      )}
    </View>
  );
};

export default SingleAppointment;
