import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native';

type UpdateMetricsProps = {
  childId: string;
  childName: string;
  onUpdateMetrics: (newMetrics: { height: string; weight: string; headCircumference: string }) => void;
};

const UpdateMetrics: React.FC<UpdateMetricsProps> = ({ childId, childName, onUpdateMetrics }) => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');

  const handleSubmit = () => {
    // Validate input values
    if (!height || !weight || !headCircumference) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    // Call the onUpdateMetrics function passed as prop
    onUpdateMetrics({ height, weight, headCircumference });

    // Clear input fields after submission
    setHeight('');
    setWeight('');
    setHeadCircumference('');
  };

  return (
    <View style={{ padding: 16 }}>

        <Text className='text-2xl mb-8 font-semibold'>Update Growth Metrics</Text>
      
      <Text className='mb-2 font-semibold'>Update Height:</Text>
      <TextInput
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      <Text className='mb-2 font-semibold'>Update Weight:</Text>
      <TextInput
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      <Text className='mb-2 font-semibold'>Update Head Circumference:</Text>
      <TextInput
        placeholder="Head Circumference (cm)"
        value={headCircumference}
        onChangeText={setHeadCircumference}
        keyboardType="numeric"
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />
      <TouchableOpacity 
        className='bg-blue-200 p-3 rounded mb-5'
        onPress={handleSubmit}
      >
        <Text className='text-center text-blue-800 font-semibold mt-2 mb-2'>Update Metrics</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UpdateMetrics;