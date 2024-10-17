import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface HeaderProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedTab, setSelectedTab }) => {
  return (
    <View className="h-60 bg-blue-400 rounded-b-3xl py-9">
      {/* Top section with app logo and icons */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        {/* App logo placeholder */}
        <View>
          <Text className="text-lg font-semibold text-gray-800">App Logo</Text>
        </View>

        {/* Notification and profile icons */}
        <View className="flex-row space-x-4">
          <TouchableOpacity>
            <Ionicons name="notifications" size={25} color="black" />
            {/* Notification count badge */}
            <View className="absolute -top-2 -right-3 bg-red-500 rounded-full h-4 w-4 justify-center items-center">
              <Text className="text-white text-xs">9</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <MaterialCommunityIcons name="account-outline" size={25} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom navigation section */}
      <View className="flex-row justify-center mt-16 bg-blue-300 w-3/5 mx-auto">
        {/* Navigation buttons */}
        <TouchableOpacity
          onPress={() => setSelectedTab('upcomingEvents')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'upcomingEvents' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'upcomingEvents' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Upcoming Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('completedEvents')}
          className={`mx-4 px-6 py-2 rounded-full ${
            selectedTab === 'completedEvents' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'completedEvents' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Completed Events
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default Header;
