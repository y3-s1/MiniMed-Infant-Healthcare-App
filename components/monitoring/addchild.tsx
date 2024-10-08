import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore'; // Ensure you have firebase/firestore installed
import { Picker } from '@react-native-picker/picker'; // Import Picker

const AddChild = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [gender, setGender] = useState(''); // Default value can be an empty string or a default gender

  const handleAddChild = async () => {
    if (!firstname || !lastname || !gender) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const db = getFirestore();
      const childrenCollection = collection(db, 'Children'); // Replace 'Children' with your actual collection name

      await addDoc(childrenCollection, {
        firstname,
        lastname,
        birthday: birthday.toISOString(), // Store the date in ISO format
        gender,
      });

      Alert.alert('Success', 'Child added successfully!');
      // Reset form
      setFirstname('');
      setLastname('');
      setBirthday(new Date());
      setGender('');
    } catch (error) {
      console.error('Error adding child: ', error);
      Alert.alert('Error', 'Could not add child. Please try again.');
    }
  };

  return (
    <ScrollView className='flex-1 bg-gray-100 p-4'>
      <Text className='text-lg font-semibold mb-4'>Add Child</Text>

      {/* First Name Input */}
      <Text className='mb-1'>First Name</Text>
      <TextInput
        placeholder="Enter First Name"
        value={firstname}
        onChangeText={setFirstname}
        className='border p-2 mb-4'
      />

      {/* Last Name Input */}
      <Text className='mb-1'>Last Name</Text>
      <TextInput
        placeholder="Enter Last Name"
        value={lastname}
        onChangeText={setLastname}
        className='border p-2 mb-4'
      />

      {/* Birthday Picker */}
      <Text className='mb-1'>Birthday</Text>
      <View className='flex-row justify-between mb-4'>
        {/* Year Picker */}
        <View className='flex-1 mr-2'>
          <Text className='mb-1'>Year</Text>
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
          <Text className='mb-1'>Month</Text>
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
          <Text className='mb-1'>Day</Text>
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
      <Text className='mb-4'>Selected Date: {birthday.toLocaleDateString()}</Text>

      {/* Gender Picker */}
      <Text className='mb-1'>Gender</Text>
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => setGender(itemValue)}
        className='border p-2 mb-4'
      >
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
      </Picker>

      {/* Add Child Button */}
      <Button title="Add Child" onPress={handleAddChild} />
    </ScrollView>
  );
}

export default AddChild;
