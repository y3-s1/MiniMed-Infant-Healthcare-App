import { View, Text } from 'react-native';
import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import AddAppointment from '@/components/appointments/appointments/addAppointment';

const addAppointment = () => {
  const { midwifeId, selectedLocation, sessionType, filteredMidwifeSessions } = useLocalSearchParams();

  // Parse the sessions back into an array
  const sessions = JSON.parse(filteredMidwifeSessions as string);

  // Ensure midwifeId, selectedLocation, and sessionType are strings
  const parsedMidwifeId = Array.isArray(midwifeId) ? midwifeId[0] : midwifeId;
  const parsedSelectedLocation = Array.isArray(selectedLocation) ? selectedLocation[0] : selectedLocation;
  const parsedSessionType = Array.isArray(sessionType) ? sessionType[0] : sessionType;

  console.log("filteredMidwifeSessions in add appointments page", sessions);

  return (
    <View>
      <AddAppointment 
        sessions={sessions} 
        midwifeId={parsedMidwifeId} 
        selectedLocation={parsedSelectedLocation} 
        sessionType={parsedSessionType} 
      />
    </View>
  );
}

export default addAppointment;
