import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

interface Child {
  id: string;
  name: string;
}

const Childs = () => {
  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: 'Onara Yenumi' },
  ]);

  // Function to add a new child (you can implement an input modal for this)
  const addChild = () => {
    const newChild: Child = { id: `${children.length + 1}`, name: 'New Child' };
    setChildren([...children, newChild]);
  };

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      <Text className='text-lg font-semibold mb-2'>Childs</Text>

      {/* Child Card */}
      <View className='bg-blue-200 rounded-2xl p-4 flex-row items-center mb-4'>
        <MaterialCommunityIcons name='account-outline' size={30} color='black' />
        <Text className='text-lg font-semibold ml-4'>{children[0]?.name}</Text>
      </View>

      {/* Add Child Button (centered) */}
      <TouchableOpacity
        onPress={addChild}
        className='bg-white p-4 w-16 rounded-full items-center justify-center border-2 border-gray-400 mb-4 self-center' // self-center to horizontally center
      >
        <Ionicons name='add' size={30} color='black' />
      </TouchableOpacity>
    </View>
  );
};

export default Childs;
