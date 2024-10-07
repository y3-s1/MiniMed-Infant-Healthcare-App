import { View, ScrollView } from 'react-native';
import React from 'react';
import VaccinatonDetail from '@/components/vaccination/vaccine/VaccinatonDetailAll';
import VaccinationDetailsCompleted from '@/components/vaccination/vaccine/VaccinationDetailsCompleted';
import { useLocalSearchParams } from 'expo-router';

const VaccDetail = () => {
  const { vaccineId, status } = useLocalSearchParams();  // Extract status and vaccineId

  return (
    <View>
      {/* vaccine details */}
      <ScrollView>
        {/* Conditionally render the detail component based on the status */}
        {status === 'Completed' ? (
          <VaccinationDetailsCompleted vaccine={vaccineId}  />
        ) : (
          <VaccinatonDetail vaccine={vaccineId} />
        )}
      </ScrollView>
    </View>
  );
};

export default VaccDetail;
