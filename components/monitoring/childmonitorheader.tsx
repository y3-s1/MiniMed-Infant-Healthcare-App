import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface HeaderProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Childmonitorheader: React.FC<HeaderProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <View className="h-50 bg-blue-400 rounded-b-3xl py-4">
      {/* Bottom navigation section */}
      <View className="flex-row justify-center mt-16 bg-transparent w-4/5 mx-auto space-x-4">
        <TouchableOpacity
          onPress={() => setSelectedTab('Childdetails')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'Childdetails' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Childdetails' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Child Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Monitor')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'Monitor' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Monitor' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Monitor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('updatemetrics')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'updatemetrics' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'updatemetrics' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Update Metrics
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default Childmonitorheader;
