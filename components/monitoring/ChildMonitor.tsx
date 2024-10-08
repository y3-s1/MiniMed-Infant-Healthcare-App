import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Childmonitorheader from './childmonitorheader';
import UniqueChildDetails from './uniqueChildMonitoring/uniquechilddetails';
import UniqueMonitor from './uniqueChildMonitoring/uniquemonitor';
import UpdateMetrics from './uniqueChildMonitoring/updatemetrics';

type RootStackParamList = {
  ChildMonitor: { childId: string; childName: string };
};

type ChildMonitorRouteProp = RouteProp<RootStackParamList, 'ChildMonitor'>;
type ChildMonitorNavigationProp = StackNavigationProp<RootStackParamList, 'ChildMonitor'>;

type Props = {
  route: ChildMonitorRouteProp;
  navigation: ChildMonitorNavigationProp;
};

const ChildMonitor: React.FC<Props> = ({ route }) => {
  const { childId, childName } = route.params;

  // Set the default selectedTab to 'Childdetails'
  const [selectedTab, setSelectedTab] = useState('Childdetails');

  return (
    <View className="flex-1">
      {/* Header with tabs */}
      <Childmonitorheader selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Scrollable content */}
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold mb-4">Monitoring {childName}</Text>

        {/* Conditionally render content based on selected tab */}
        {selectedTab === 'Childdetails' && (
          <UniqueChildDetails childId={childId} childName={childName} />
        )}

        {selectedTab === 'Monitor' && (
          <UniqueMonitor childId={childId} childName={childName} />
        )}

        {selectedTab === 'updatemetrics' && (
          <UpdateMetrics childId={childId} childName={childName} />
        )}
      </ScrollView>
    </View>
  );
};

export default ChildMonitor;
