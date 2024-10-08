import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

type UniqueChildDetailsProps = {
  childId: string;
  childName: string;
  birthday: string;
  gender: string;
  height: number;
  weight: number;
  headCircumference: number;
  onDeleteChild: (childId: string) => void; // Prop to handle delete
};

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

const UniqueChildDetails: React.FC<UniqueChildDetailsProps> = ({
  childId,
  childName,
  birthday,
  gender,
  height,
  weight,
  headCircumference,
  onDeleteChild, // Receive delete function as a prop
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${childName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            onDeleteChild(childId); // Call the delete function passed from the parent
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View>
      <Text className="text-lg font-semibold mb-5 mt-5">
        <Text className="text-3xl font-bold text-blue-500">{childName}</Text>
      </Text>
      <Text className="text-lg font-semibold mb-1 text-gray-600">
        Age: <Text className="font-bold text-blue-500">{calculateAge(birthday)}</Text>
      </Text>
      <Text className="text-lg font-semibold mb-1 text-gray-600">
        Gender: <Text className="font-bold text-blue-500">{gender}</Text>
      </Text>
      <Text className="text-lg font-semibold mb-1 text-gray-600">
        Height: <Text className="font-bold text-blue-500">{height}cm</Text>
      </Text>
      <Text className="text-lg font-semibold mb-1 text-gray-600">
        Weight: <Text className="font-bold text-blue-500">{weight}kg</Text>
      </Text>
      <Text className="text-lg font-semibold text-gray-600">
        Head Circumference: <Text className="font-bold text-blue-500">{headCircumference}cm</Text>
      </Text>

      {/* Delete Button */}
      <TouchableOpacity 
        className='bg-red-500 p-3 rounded mt-5'
        onPress={handleDelete}
      >
        <Text className='text-center text-white font-semibold'>Delete Child</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UniqueChildDetails;
