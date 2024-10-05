import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';


interface Reminder {
    id: string;
    vaccine: string;
    date: string;
    description: string;
  }



const Reminders = () => {


    const [reminders, setReminders] = useState<Reminder[]>([
        {
          id: '1',
          vaccine: 'Pentavalent 2',
          date: '14-05-2023',
          description: 'Gravida elementum malesuada malesuada sed aliquam cursus.',
        },
      ]);
  return (
    <View className='flex-1 bg-gray-100 p-4'> 
      {/* Reminders Section */}
      <Text className='text-lg font-semibold mb-2'>Reminders</Text>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className='bg-cyan-200 rounded-lg p-4 mb-4'>
            <View className='flex-row justify-between items-center mb-2'>
              <Text className='text-lg font-semibold'>
                Vaccine - <Text className='font-bold'>{item.vaccine}</Text>
              </Text>
              <Ionicons name='notifications' size={24} color='black' />
            </View>
            <Text className='text-gray-600'>{item.description}</Text>
            <View className='flex-row justify-between items-center mt-4'>
              <Text className='text-sm text-gray-500'>{item.date}</Text>
              <TouchableOpacity className='bg-gray-800 p-2 rounded-lg'>
                <Text className='text-white text-xs'>Participating</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default Reminders