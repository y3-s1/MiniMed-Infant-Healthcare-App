import React from 'react';
import { View, Text } from 'react-native';

type UniqueChildDetailsProps = {
  childId: string;
  childName: string;
};

const UniqueChildDetails: React.FC<UniqueChildDetailsProps> = ({ childId, childName }) => {
  return (
    <View>
      <Text>hellowww Details for {childName} (ID: {childId})</Text>
      {/* Render more details here */}
    </View>
  );
};

export default UniqueChildDetails;
