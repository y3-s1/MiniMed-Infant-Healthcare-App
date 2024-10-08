import React from 'react';
import { View, Text } from 'react-native';

type UniqueChildDetailsProps = {
  childId: string;
  childName: string;
  birthday: string; // Add birthday
  gender: string;   // Add gender
  height: number;   // Add height
  weight: number;   // Add weight
  headCircumference: number; // Add head circumference
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
}) => {
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
    </View>
  );
};

export default UniqueChildDetails;
