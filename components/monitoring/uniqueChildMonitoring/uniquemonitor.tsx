import React from 'react';
import { View, Text } from 'react-native';

type UniqueMonitorProps = {
  childId: string;
  childName: string;
};

const UniqueMonitor: React.FC<UniqueMonitorProps> = ({ childId, childName }) => {
  return (
    <View>
      <Text>hellowww Monitoring data for {childName} (ID: {childId})</Text>
      {/* Render monitoring data here */}
    </View>
  );
};

export default UniqueMonitor;
