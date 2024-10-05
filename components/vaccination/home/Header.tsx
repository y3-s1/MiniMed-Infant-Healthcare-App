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
    <View className="h-80 bg-cyan-400 rounded-b-3xl py-9">
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
      <View className="flex-row justify-center mt-28 bg-cyan-300 w-3/5 mx-auto">
        {/* Navigation buttons */}
        <TouchableOpacity
          onPress={() => setSelectedTab('Home')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'Home' ? 'bg-white' : 'bg-cyan-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Home' ? 'text-cyan-500' : 'text-white'
            } font-poppins`}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Vaccination')}
          className={`mx-4 px-6 py-2 rounded-full ${
            selectedTab === 'Vaccination' ? 'bg-white' : 'bg-cyan-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Vaccination' ? 'text-cyan-500' : 'text-white'
            } font-poppins`}
          >
            Vaccination
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Analysis')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'Analysis' ? 'bg-white' : 'bg-cyan-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Analysis' ? 'text-cyan-500' : 'text-white'
            } font-poppins`}
          >
            Analysis
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
