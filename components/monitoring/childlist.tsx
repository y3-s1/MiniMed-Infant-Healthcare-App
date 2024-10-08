import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getFirestore, collection, getDocs } from 'firebase/firestore'; // Make sure you have firebase/firestore installed

interface Child {
  id: string;
  firstname: string;
  lastname: string;
}

const ChildList = () => {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    const fetchChildren = async () => {
      const db = getFirestore();
      const childrenCollection = collection(db, 'Children'); // Replace 'children' with your actual collection name
      const childrenSnapshot = await getDocs(childrenCollection);
      const childrenList = childrenSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Child[];
      setChildren(childrenList);
    };

    fetchChildren();
  }, []);

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      {/* Children Section */}
      <Text className='text-lg font-semibold mb-2'>Children List</Text>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className='bg-blue-200 rounded-lg p-4 mb-4'>
            <View className='flex-row justify-between items-center mb-2'>
              <Text className='text-lg font-semibold'>
                Name - <Text className='font-bold'>{item.firstname} {item.lastname}</Text>
              </Text>
              <Ionicons name='person' size={24} color='black' />
            </View>
          </View>
        )}
      />
    </View>
  );
}

export default ChildList;
