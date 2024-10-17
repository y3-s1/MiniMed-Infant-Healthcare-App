import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import HeadCircumferenceMonetoring from './metricsmonitering/headcircumferencemonetoring';
import HeightMonitoring from './metricsmonitering/heightmonetoring';
import WeightMonitoring from './metricsmonitering/weightmonetoring';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { UserContext } from '@/contexts/userContext';

type UniqueMonitorProps = {
  childId: string;
  childName: string;
};

const UniqueMonitor: React.FC<UniqueMonitorProps> = ({ childId, childName }) => {
  const [selectedTab, setSelectedTab] = useState('Height');

  return (
    <View className="flex-1">
      {/* Tabs */}
      <View className="flex-row justify-around py-4">
        <TouchableOpacity onPress={() => setSelectedTab('Height')}>
          <Text className={selectedTab === 'Height' ? 'font-bold text-blue-500' : 'text-gray-500'}>
            Height
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Weight')}>
          <Text className={selectedTab === 'Weight' ? 'font-bold text-blue-500' : 'text-gray-500'}>
            Weight
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('HeadCircumference')}>
          <Text className={selectedTab === 'HeadCircumference' ? 'font-bold text-blue-500' : 'text-gray-500'}>
            Head Circumference
          </Text>
        </TouchableOpacity>
      </View>

      {/* Monitoring Data */}
      <View className="p-4">
        {selectedTab === 'Height' && <HeightMonitoring childId={childId}/>}
        {selectedTab === 'Weight' && <WeightMonitoring childId={childId} />}
        {selectedTab === 'HeadCircumference' && <HeadCircumferenceMonetoring childId={childId}/>}
      </View>
    </View>
  );
};

export default UniqueMonitor;
