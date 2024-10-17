import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from '../../../config/FireBaseConfig';
import { router } from 'expo-router';
import { UserContext } from '@/contexts/userContext';
import VaccSearchbar from '../searchBar/VaccSearbar';  // Import the search bar component

interface VaccinationItem {
  id: string;
  name: string;
  age: string;
  image: string;
  nationalHealthGuidelines: string;
  status: 'Completed' | 'Scheduled' | 'Pending';
}


// StepIndicator component
const StepIndicator = ({ index, status }: { index: number, status: 'Completed' | 'Scheduled' |'pending' }) => {
  const isCompleted = status === 'Completed';

  
  return (
    <View className='items-center'>
      <View className={`w-0.5 flex-1 ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`} />
      {/* Step Number */}
      <View className={`w-7 h-7  rounded-full items-center justify-center ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`}>
        <Text className='text-white text-lg font-bold'>{index}</Text>
      </View>

      <View className={`w-0.5 flex-1 ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`} />
      {/* Line between steps */}
    </View>
  );
};

const VaccinationTab = () => {
  const [selectedTab, setSelectedTab] = useState<'All' | 'Completed' | 'Scheduled'>('All');
  const [vaccinations, setVaccinations] = useState<VaccinationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Search query state

  const { user, selectedChildId } = useContext(UserContext);

  useEffect(() => {
    fetchVaccinationData();
  }, [selectedChildId]);

  const fetchVaccinationData = async () => {
    try {
      setLoading(true);

      // Fetch the master vaccination schedule
      const scheduleSnapshot = await getDocs(collection(db, "VaccinationSchedules"));
      const scheduleData = scheduleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch the vaccination record of a specific child
      const vaccinationRecordsRef = collection(db, 'VaccinationRecords');
      const vaccinationRecordsQuery = query(
        vaccinationRecordsRef,
        where('UserId', '==', user.uid),
        where('childId', '==', selectedChildId),
      );

      const childDoc = await getDocs(vaccinationRecordsQuery);
      const childData = childDoc.docs.map(doc => doc.data());

      // Merge data from vaccinationSchedule and child vaccinationRecord
      const mergedData = scheduleData.map((vaccine) => {
        const matchingRecords = childData.filter(rec => rec.vaccineId === vaccine.id);

        let status = 'Pending';  // Default to 'Pending'
        if (matchingRecords.length > 0) {
          const completedRecord = matchingRecords.find(record => record.status === 'Completed');
          if (completedRecord) {
            status = 'Completed';
          } else {
            const scheduledRecord = matchingRecords.find(record => record.status === 'Scheduled');
            status = scheduledRecord ? 'Scheduled' : matchingRecords[0].status;
          }
        }

        return {
          id: vaccine.id,
          name: vaccine.vaccineName,
          age: vaccine.ageDue,
          image: vaccine.imageUrl,
          nationalHealthGuidelines: vaccine.nationalHealthGuidelines,
          status,
        };
      });

      setVaccinations(mergedData);
    } catch (error) {
      console.error("Error fetching vaccination data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredVaccinations = () => {
    // Apply the selected tab filter
    let filteredVaccinations = vaccinations;
    if (selectedTab !== 'All') {
      filteredVaccinations = vaccinations.filter(vaccine => vaccine.status === selectedTab);
    }

    // Apply the search query filter
    if (searchQuery.trim()) {
      filteredVaccinations = filteredVaccinations.filter(vaccine =>
        vaccine.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredVaccinations;
  };

  const renderVaccinationItem = ({ item, index }: { item: VaccinationItem, index: number }) => (
    <Pressable className='flex-row items-center '>
      <StepIndicator index={index + 1} status={item.status} />
      <TouchableOpacity
        onPress={() => router.navigate({
          pathname: '/vaccination/vaccineDetails',
          params: { vaccineId: item.id, status: item.status },
        })}
        style={styles.shadow}
        className='flex-1 bg-white p-3 mb-4 ml-3 h-32 rounded-xl flex-row justify-between'
      >
        <View className=''>
          <Text className='text-xl'>{item.name}</Text>
          <Text className='font-normal text-slate-400'>{item.nationalHealthGuidelines}</Text>
          <Text className='font-normal pt-3 mb-2'>{item.age}</Text>
        </View>
        <Image className='w-20 rounded' source={{ uri: item?.image }} />
      </TouchableOpacity>
    </Pressable>
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className='flex-1 bg-gray-100'>
      {/* Search Bar */}
      <VaccSearchbar onSearch={setSearchQuery} />

      {/* Tabs */}
      <View className='flex-row justify-start mt-1 mb-4'>
        <TouchableOpacity
          onPress={() => setSelectedTab('All')}
          className={`px-3 py-2 ${selectedTab === 'All' ? 'border-b-4 border-blue-500' : ''}`}
        >
          <Text className={`${selectedTab === 'All' ? 'text-blue-500' : 'text-gray-500'} text-lg`}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('Completed')}
          className={`px-3 py-2 ${selectedTab === 'Completed' ? 'border-b-4 border-blue-500' : ''}`}
        >
          <Text className={`${selectedTab === 'Completed' ? 'text-blue-500' : 'text-gray-500'} text-lg`}>Completed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab('Scheduled')}
          className={`px-3 py-2 ${selectedTab === 'Scheduled' ? 'border-b-4 border-blue-500' : ''}`}
        >
          <Text className={`${selectedTab === 'Scheduled' ? 'text-blue-500' : 'text-gray-500'} text-lg`}>Scheduled</Text>
        </TouchableOpacity>
      </View>

      {/* Vaccination List */}
      <FlatList
        data={getFilteredVaccinations()}
        renderItem={renderVaccinationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  }
});

export default VaccinationTab;
