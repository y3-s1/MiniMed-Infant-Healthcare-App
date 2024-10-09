import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <View>
          <Text className="text-lg font-semibold text-gray-800">App Logo</Text>
        </View>

        <View className="flex-row space-x-4">
          <TouchableOpacity>
            <MaterialCommunityIcons name="account-outline" size={25} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom navigation section */}
      <View className="flex-row justify-center mt-16 bg-transparent w-4/5 mx-auto space-x-4">
        <TouchableOpacity
          onPress={() => setSelectedTab('ChildList')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'ChildList' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'ChildList' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Child List
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('AddChild')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'AddChild' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'AddChild' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Add Child
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
