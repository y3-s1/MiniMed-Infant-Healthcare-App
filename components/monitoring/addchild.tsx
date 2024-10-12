import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import React, { useContext, useState } from 'react';
import { getFirestore, collection, addDoc, doc } from 'firebase/firestore'; // Ensure you have firebase/firestore installed
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { UserContext } from '@/contexts/userContext';

const AddChild = () => {

  const { user } = useContext(UserContext);
  

  const [name, setName] = useState(''); // Name instead of firstname/lastname
  const [birthday, setBirthday] = useState(new Date());
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState(''); // Height in cm
  const [weight, setWeight] = useState(''); // Weight in kg
  const [headCircumference, setHeadCircumference] = useState(''); // Head circumference in cm
  const [location, setLocation] = useState(''); // New location state
  const userId = user?.uid; // The fixed user ID for now

  const handleAddChild = async () => {
    if (!name || !gender || !height || !weight || !headCircumference || !location) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'Users', userId); // Reference the user's document
      const childrenCollection = collection(userDocRef, 'Childrens'); // Reference the 'Childrens' sub-collection

      // Add a new child document with measurement history and location
      await addDoc(childrenCollection, {
        name,
        birthday: birthday.toISOString(), // Store the date in ISO format
        gender,
        location, // Include location
        measurements: {
          heightHistory: [{ value: height, date: new Date().toISOString() }],
          weightHistory: [{ value: weight, date: new Date().toISOString() }],
          headCircumferenceHistory: [{ value: headCircumference, date: new Date().toISOString() }]
        }
      });

      Alert.alert('Success', 'Child added successfully!');
      // Reset form
      setName('');
      setBirthday(new Date());
      setGender('');
      setHeight('');
      setWeight('');
      setHeadCircumference('');
      setLocation('');
    } catch (error) {
      console.error('Error adding child: ', error);
      Alert.alert('Error', 'Could not add child. Please try again.');
    }
  };

  return (
    <ScrollView className='flex-1 p-4'>
      <Text className='text-lg font-semibold mb-7'>Add Child</Text>

      {/* Name Input */}
      <Text className='mb-1 font-semibold'>Name</Text>
      <TextInput
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      {/* Birthday Picker */}
      <Text className='mb-1 font-semibold mb-3'>Birthday</Text>
      <View className='flex-row justify-between mb-4'>
        {/* Year Picker */}
        <View className='flex-1 mr-2'>
          <Text className='mb-1 font-semibold'>Year</Text>
          <Picker
            selectedValue={birthday.getFullYear()}
            onValueChange={(itemValue) => {
              const newDate = new Date(birthday);
              newDate.setFullYear(itemValue);
              setBirthday(newDate);
            }}
            className='border p-2'
          >
            {[...Array(50).keys()].map((i) => {
              const year = new Date().getFullYear() - i; // Show last 50 years
              return <Picker.Item key={year} label={String(year)} value={year} />;
            })}
          </Picker>
        </View>

        {/* Month Picker */}
        <View className='flex-1 mr-2'>
          <Text className='mb-1 font-semibold'>Month</Text>
          <Picker
            selectedValue={birthday.getMonth() + 1} // Month is 0-indexed
            onValueChange={(itemValue) => {
              const newDate = new Date(birthday);
              newDate.setMonth(itemValue - 1); // Adjust for 0-index
              setBirthday(newDate);
            }}
            className='border p-2'
          >
            {[...Array(12).keys()].map((i) => (
              <Picker.Item key={i + 1} label={String(i + 1)} value={i + 1} />
            ))}
          </Picker>
        </View>

        {/* Day Picker */}
        <View className='flex-1'>
          <Text className='mb-1 font-semibold'>Day</Text>
          <Picker
            selectedValue={birthday.getDate()}
            onValueChange={(itemValue) => {
              const newDate = new Date(birthday);
              newDate.setDate(itemValue);
              setBirthday(newDate);
            }}
            className='border p-2'
          >
            {[...Array(31).keys()].map((i) => (
              <Picker.Item key={i + 1} label={String(i + 1)} value={i + 1} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Display selected date */}
      <Text className='mb-4 font-semibold mb-10'>Selected Date: {birthday.toLocaleDateString()}</Text>

      {/* Gender Picker */}
      <Text className='mb-1 font-semibold'>Gender</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        className='border p-2 mb-4'
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
      </Picker>

      {/* Height Input */}
      <Text className='mb-1 font-semibold'>Height (cm)</Text>
      <TextInput
        placeholder="Enter Height in cm"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      {/* Weight Input */}
      <Text className='mb-1 font-semibold'>Weight (kg)</Text>
      <TextInput
        placeholder="Enter Weight in kg"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      {/* Head Circumference Input */}
      <Text className='mb-1 font-semibold'>Head Circumference (cm)</Text>
      <TextInput
        placeholder="Enter Head Circumference in cm"
        value={headCircumference}
        onChangeText={setHeadCircumference}
        keyboardType="numeric"
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      {/* Location Input */}
      <Text className='mb-1 font-semibold'>Location</Text>
      <TextInput
        placeholder="Enter Location"
        value={location}
        onChangeText={setLocation}
        className='border border-gray-400 p-3 mb-8 rounded'
        placeholderTextColor="#888"
      />

      {/* Add Child Button */}
      <TouchableOpacity 
        className='bg-blue-200 p-3 rounded mb-5'
        onPress={handleAddChild}
      >
        <Text className='text-center text-blue-800 font-semibold mt-2 mb-2'>Add Child</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default AddChild;
