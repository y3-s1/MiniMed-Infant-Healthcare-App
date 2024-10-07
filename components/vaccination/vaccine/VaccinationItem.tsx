import { View, Text, TouchableOpacity, FlatList, Image, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '../../../config/FireBaseConfig';
import { router } from 'expo-router';

interface VaccinationItem {
  id: string;
  name: string;
  age: string;
  image: string;
  status: 'Completed' | 'Scheduled' | 'pending';
}


// StepIndicator component
const StepIndicator = ({ index, status }: { index: number, status: 'Completed' | 'Scheduled' |'pending' }) => {
  const isCompleted = status === 'Completed';

  return (
    <View className='items-center'>
      {/* Step Number */}
      <View className={`w-8 h-8  rounded-full items-center justify-center ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`}>
        <Text className='text-white font-bold'>{index}</Text>
      </View>

      {/* Line between steps */}
      <View className={`w-0.5 flex-1 ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`} />
    </View>
  );
};

// VaccinationTab component
const VaccinationTab = () => {
  
  const [selectedTab, setSelectedTab] = useState<'All' | 'Completed' | 'Scheduled'>('All');
  const [vaccinations, setVaccinations] = useState<VaccinationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);



  useEffect(() => {
    fetchVaccinationData();
  }, []);


  const fetchVaccinationData = async () => {
    try {
      setLoading(true);

      // Fetch the master vaccination schedule
      const scheduleSnapshot = await getDocs(collection(db, "VaccinationSchedules"));
      const scheduleData = scheduleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() 
      }));
      // Fetch the vaccination record of a specific child (example childId)
      const childDoc = await getDocs(collection(db, "Users", "ZVRLK2MapOWefe2BYC1L", "Childrens", "ChildID_abc", "VaccinationRecords"));
      const childData = childDoc.docs.map(doc => doc.data());

      // Merge data from vaccinationSchedule and child vaccinationRecord
      const mergedData = scheduleData.map((vaccine) => {
        const record = childData.find((rec) => rec.vaccineId === vaccine.id);

        console.log(record)
        console.log(vaccine)
        return {
          id: vaccine.id,
          name: vaccine.vaccineName,
          age: vaccine.ageDue,
          image: vaccine.imageUrl,
          status: record ? record.status : 'Pending',  // If no record, consider it pending
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
    if (selectedTab === 'All') {
      return vaccinations;
    }
    return vaccinations.filter((vaccine) => vaccine.status === selectedTab);
  };

  const renderVaccinationItem = ({ item, index }: { item: VaccinationItem, index: number }) => (
    <Pressable 

    onPress={() => router.navigate({
      pathname: '/vaccination/vaccineDetails',
      params: { vaccineId: item.id, status: item.status },  
    })}
    className='flex-row items-center mb-4'>
      {/* Step Indicator */}
      <StepIndicator index={index + 1} status={item.status} />

      {/* Vaccination Info */}
      <View className='flex-1 bg-white p-3 ml-4 rounded-xl flex-row'>
      <Image className='w-8 h-12 rounded' source={{ uri:item?.image }}/>
      {/* <Ionicons name='medkit-outline' size={25} color='black' /> */}
      <View className='ml-4'>
        <Text className='font-normal text-slate-400'>{item.age}</Text>
        <Text className='text-xl'>{item.name}</Text>
      </View>
      <TouchableOpacity className='ml-auto bg-cyan-400 p-1 h-10 w-12 rounded-xl'>
        <Text className='text-white font-semibold m-auto'>View</Text>
      </TouchableOpacity>
    </View>

    </Pressable>
  );


  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className='flex-1 bg-gray-100'>
      {/* Tabs */}
      <View className='flex-row justify-center mt-1'>
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
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default VaccinationTab;
