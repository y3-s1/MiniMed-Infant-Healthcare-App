import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Childmonitorheader from './childmonitorheader';

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

  return (
    <View className="flex-1">
      <Childmonitorheader />
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold mb-4">Monitor: {childName}</Text>
        <Text>Child ID: {childId}</Text>
        {/* Add more monitoring details and functionality here */}
      </ScrollView>
    </View>
  );
};

export default ChildMonitor;