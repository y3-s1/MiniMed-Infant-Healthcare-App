import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

interface VaccinationItem {
  id: string;
  name: string;
  age: string;
  status: 'Completed' | 'Scheduled';
}

const vaccinations: VaccinationItem[] = [
  { id: '1', name: 'B.C.G', age: 'At Birth', status: 'Completed' },
  { id: '2', name: 'Pentavalent 1', age: '2 Months Completed', status: 'Completed' },
  { id: '3', name: 'OPV 1', age: '2 Months Completed', status: 'Completed' },
  { id: '4', name: 'Pentavalent 2', age: '>4 Months Completed', status: 'Scheduled' },
];

// StepIndicator component
const StepIndicator = ({ index, status }: { index: number, status: 'Completed' | 'Scheduled' }) => {
  const isCompleted = status === 'Completed';

  return (
    <View className='items-center'>
      {/* Step Number */}
      <View className={`w-8 h-8 rounded-full items-center justify-center ${isCompleted ? 'bg-blue-500' : 'bg-gray-300'}`}>
        <Text className='text-white font-bold'>{index}</Text>
      </View>

      {/* Line between steps */}
      <View className={`w-1 flex-1 ${isCompleted ? 'bg-blue-500' : 'bg-gray-300'}`} />
    </View>
  );
};

// VaccinationTab component
const VaccinationTab = () => {
  const [selectedTab, setSelectedTab] = useState<'All' | 'Completed' | 'Scheduled'>('All');

  const getFilteredVaccinations = () => {
    if (selectedTab === 'All') {
      return vaccinations;
    }
    return vaccinations.filter((vaccine) => vaccine.status === selectedTab);
  };

  const renderVaccinationItem = ({ item, index }: { item: VaccinationItem, index: number }) => (
    <View className='flex-row items-center mb-4'>
      {/* Step Indicator */}
      <StepIndicator index={index + 1} status={item.status} />

      {/* Vaccination Info */}
      <View className='flex-1 bg-white p-4 ml-4 rounded-xl'>
      <Ionicons name='medkit-outline' size={20} color='black' />
      <View className='ml-4'>
        <Text className='font-bold'>{item.age}</Text>
        <Text className='text-xl'>{item.name}</Text>
      </View>
      <TouchableOpacity className='ml-auto bg-cyan-400 p-2 w-16 rounded-lg'>
        <Text className='text-white font-semibold m-auto'>View</Text>
      </TouchableOpacity>
    </View>

    </View>
  );


  return (
    <View className='flex-1 bg-gray-100'>
      {/* Tabs */}
      <View className='flex-row justify-center mt-2'>
        <TouchableOpacity
          onPress={() => setSelectedTab('All')}
          className={`px-6 py-2 ${selectedTab === 'All' ? 'border-b-4 border-blue-500' : ''}`}
        >
          <Text className={`${selectedTab === 'All' ? 'text-blue-500' : 'text-gray-500'} text-lg`}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Completed')}
          className={`px-6 py-2 ${selectedTab === 'Completed' ? 'border-b-4 border-blue-500' : ''}`}
        >
          <Text className={`${selectedTab === 'Completed' ? 'text-blue-500' : 'text-gray-500'} text-lg`}>Completed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Scheduled')}
          className={`px-6 py-2 ${selectedTab === 'Scheduled' ? 'border-b-4 border-blue-500' : ''}`}
        >
          <Text className={`${selectedTab === 'Scheduled' ? 'text-blue-500' : 'text-gray-500'} text-lg`}>Scheduled</Text>
        </TouchableOpacity>
      </View>

      {/* Vaccination List */}
      <FlatList
        data={getFilteredVaccinations()}
        renderItem={renderVaccinationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default VaccinationTab;
