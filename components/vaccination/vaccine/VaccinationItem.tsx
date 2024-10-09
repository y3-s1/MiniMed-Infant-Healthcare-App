import { View, Text, TouchableOpacity, FlatList, Image, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, doc, getDoc, where, query } from "firebase/firestore";
import { db } from '../../../config/FireBaseConfig';
import { router } from 'expo-router';

interface VaccinationItem {
  id: string;
  name: string;
  age: string;
  image: string;
  nationalHealthGuidelines: string;
  status: 'Completed' | 'Scheduled' | 'pending';
}


// StepIndicator component
const StepIndicator = ({ index, status }: { index: number, status: 'Completed' | 'Scheduled' |'pending' }) => {
  const isCompleted = status === 'Completed';

  return (
    <View className='items-center'>
      {/* Step Number */}
      <View className={`w-0.5 flex-1 ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`} />
      <View className={`w-6 h-6  rounded-full items-center justify-center ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`}>
        <Text className='text-white font-bold'>{index}</Text>
      </View>

      <View className={`w-0.5 flex-1 ${isCompleted ? 'bg-slate-600' : 'bg-gray-300'}`} />
      {/* Line between steps */}
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
      const vaccinationRecordsRef = collection(db, 'VaccinationRecords');

  // Create the query with multiple filters: userId, childId, and vaccineId
      const vaccinationRecordsQuery = query(
        vaccinationRecordsRef,
        where('UserId', '==', '2DaIkDN1VUuNGk199UBJ'),
        where('childId', '==', 'Child_2'),
      );

      const childDoc = await getDocs(vaccinationRecordsQuery);
      const childData = childDoc.docs.map(doc => doc.data());

      // Merge data from vaccinationSchedule and child vaccinationRecord
      const mergedData = scheduleData.map((vaccine) => {
        console.log('scheduledData', scheduleData);
      
        // Use filter to find all matching records from childData
        const matchingRecords = childData.filter((rec) => {
          console.log('first', rec.vaccineId, 'second', vaccine.id);
          return rec.vaccineId === vaccine.id;  // Find matching vaccine records
        });
      
        console.log('matching records for', vaccine.vaccineName, matchingRecords);
      
        // Determine the status based on the matching records
        let status = 'Pending';  // Default to 'Pending'
      
        if (matchingRecords.length > 0) {
          // First, check if there are any records with a status of 'Completed'
          const completedRecord = matchingRecords.find(record => record.status === 'Completed');
          
          if (completedRecord) {
            status = 'Completed';  // Set to 'Completed' if any matching record is completed
          } else {
            // If no record is 'Completed', check for 'Scheduled' and leave unchanged if true
            const scheduledRecord = matchingRecords.find(record => record.status === 'Scheduled');
            if (scheduledRecord) {
              status = 'Scheduled';  // Keep 'Scheduled' status as is
            } else {
              // Otherwise, use the status of the first matching record
              status = matchingRecords[0].status;
            }
          }
        }
      
        return {
          id: vaccine.id,
          name: vaccine.vaccineName,
          age: vaccine.ageDue,
          image: vaccine.imageUrl,
          nationalHealthGuidelines: vaccine.nationalHealthGuidelines,
          status: status,  // Status is either 'Completed', 'Scheduled', or 'Pending'
          matchingRecords: matchingRecords // Optionally return the matching records for reference
        };
      });

      console.log('mergedData', mergedData)
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
      <Image className='w-14 h-14 rounded' source={{ uri:item?.image }}/>
      {/* <Ionicons name='medkit-outline' size={25} color='black' /> */}
      <View className='ml-4'>
        <Text className='text-xl'>{item.name}</Text>
        <Text className='font-normal text-slate-400'>{item.age}</Text>
        <Text className='font-normal text-slate-400'>{item.nationalHealthGuidelines}</Text>
      </View>
    </View>

    </Pressable>
  );


  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View className='flex-1 bg-gray-100'>
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

export default VaccinationTab;
