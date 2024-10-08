import React from 'react';
import { View, Text } from 'react-native';

type UpdateMetricsProps = {
  childId: string;
  childName: string;
};

const UpdateMetrics: React.FC<UpdateMetricsProps> = ({ childId, childName }) => {
  return (
    <View>
      <Text>hellowww Update metrics for {childName} (ID: {childId})</Text>
      {/* Add update metrics form here */}
    </View>
  );
};

export default UpdateMetrics;
