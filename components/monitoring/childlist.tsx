import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, collection, getDocs, doc } from 'firebase/firestore';
import { UserContext } from '@/contexts/userContext';

interface Child {
  id: string;
  name: string;
  gender: string;
  birthday: string; // ISO format
}

type RootStackParamList = {
  ChildMonitor: { childId: string; childName: string };
};

type ChildListNavigationProp = StackNavigationProp<RootStackParamList, 'ChildMonitor'>;

const calculateAge = (birthday: string): string => {
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

const ChildList: React.FC = () => {

  const { user } = useContext(UserContext);

  const [children, setChildren] = useState<Child[]>([]);
  const userId = user?.uid;
  const navigation = useNavigation<ChildListNavigationProp>();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const db = getFirestore();
        const userDocRef = doc(db, 'Users', userId);
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

  const handleMonitorPress = (childId: string, childName: string) => {
    navigation.navigate('ChildMonitor', { childId, childName });
  };

  return (
    <View className="flex-1 p-4">
      <Text className="text-lg font-semibold mb-2">Children List</Text>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-blue-100 rounded-lg p-6 mb-6">
            <View className="mb-2">
              <Text className="text-lg font-semibold">
                Name: <Text className="font-bold">{item.name}</Text>
              </Text>
              <Text className="text-lg font-semibold">
                Gender: <Text className="font-bold">{item.gender}</Text>
              </Text>
              <Text className="text-lg font-semibold">
                Age: <Text className="font-bold">{calculateAge(item.birthday)}</Text>
              </Text>
            </View>
            <TouchableOpacity
              className="bg-blue-500 p-2 rounded-lg mt-2"
              onPress={() => handleMonitorPress(item.id, item.name)}
            >
              <Text className="text-white text-center font-semibold mb-1 mt-1">Monitor</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ChildList;