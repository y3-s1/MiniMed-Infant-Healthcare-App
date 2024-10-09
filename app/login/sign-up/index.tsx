import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/FireBaseConfig';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');

  // Function to handle user registration
  const handleSignUp = async () => {
    try {
      // Sign up the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Get the signed-in user's unique ID (UID)
      const user = userCredential.user;

      console.log('user.uid', user.uid)
      // Save additional user data in Firestore (Users collection)
      await setDoc(doc(db, 'Users', user.uid), {
        name,
        phoneNumber,
        email,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'User registered and data saved!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Sign In / Sign Up</Text>

      {/* Input fields for email, password, name, and phone number */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      {/* Buttons for Sign Up and Sign In */}
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

export default SignUp;
