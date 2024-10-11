import React from 'react';
import { View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import CustomerVacciSessionDetails from '@/components/vaccination/vaccine sessions/CustomerVacciSessionDetails';

const VacSessionDetail = () => {
  const route = useRoute();
  const { vaccinationRecord } = route.params; // Get the passed vaccination record

  console.log('Vaccination Record Params:', route.params);


  return (
    <View className='flex-1'>
      {/* Pass the vaccinationRecord to CustomerVaccinationDetails */}
      <CustomerVacciSessionDetails vaccinationRecord={vaccinationRecord} />
    </View>
  );
};

export default VacSessionDetail;
