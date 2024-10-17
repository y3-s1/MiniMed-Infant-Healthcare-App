import { View } from 'react-native';
import React from 'react';
import SingleAppointment from '@/components/appointments/appointments/singleAppointment';
import { useLocalSearchParams } from 'expo-router';

const singleAppointment = () => {
  const { appointmentId, midwife, date, location, time, status } = useLocalSearchParams();

  // Ensure each parameter is a string (handle array case if needed)
  const getString = (param: string | string[] | undefined): string => {
    if (Array.isArray(param)) {
      return param[0];  // Extract first value if it's an array
    }
    return param || ''; // Default to empty string if undefined or null
  };

  return (
    <View>
      <SingleAppointment 
        appointmentId={getString(appointmentId)}
        midwife={getString(midwife)}
        date={getString(date)}
        location={getString(location)}
        time={getString(time)}
        status={getString(status)}
      />
    </View>
  );
};

export default singleAppointment;
