import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';

interface Child {
  id: string;
  name: string;
  gender: string;
  birthday: string; // ISO format
}

// Function to calculate the age in years, months, and days without additional libraries
const calculateAge = (birthday: string) => {
  const birthDate = new Date(birthday);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // Adjust for cases where the birth day or month hasn't occurred yet this year/month
  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years} years, ${months} months, ${days} days`;
};

const ChildList = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const userId = '2DaIkDN1VUuNGk199UBJ'; // Fixed userId

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const db = getFirestore();
        // Reference to the 'Users' collection and the specific document by userId
        const userDocRef = doc(db, 'Users', userId);
        // Reference to the 'Childrens' sub-collection inside the user document
        const childrenCollection = collection(userDocRef, 'Childrens');
        const childrenSnapshot = await getDocs(childrenCollection);

        const childrenList = childrenSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          gender: doc.data().gender,
          birthday: doc.data().birthday, // ISO format
        })) as Child[];
        setChildren(childrenList);
      } catch (error) {
        console.error("Error fetching children: ", error);
      }
    };

    fetchChildren();
  }, []);

  return (
    <View className="flex-1 p-4">
      {/* Children Section */}
      <Text className="text-lg font-semibold mb-2">Children List</Text>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-blue-200 rounded-lg p-4 mb-4">
            <View className="mb-2">
              {/* First Name */}
              <Text className="text-lg font-semibold">
                Name: <Text className="font-bold">{item.name}</Text>
              </Text>

              {/* Gender */}
              <Text className="text-lg font-semibold">
                Gender: <Text className="font-bold">{item.gender}</Text>
              </Text>

              {/* Calculated Age */}
              <Text className="text-lg font-semibold">
                Age: <Text className="font-bold">{calculateAge(item.birthday)}</Text>
              </Text>
            </View>

            
          </View>
        )}
      />
    </View>
  );
};

export default ChildList;
