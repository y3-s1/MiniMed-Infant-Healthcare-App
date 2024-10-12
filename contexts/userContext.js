// src/contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/FireBaseConfig'; // Update the path to your Firebase config

// Create User Context
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState(null); // State to store the selected child ID

  // Listen for changes in authentication state and store user info in context and secure store
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user); // Set user in context

        // Store user UID securely for reuse across pages
        await SecureStore.setItemAsync('userUID', user.uid);

        // Optionally, load previously selected child ID if stored in secure store
        const storedChildId = await SecureStore.getItemAsync('selectedChildId');
        if (storedChildId) {
          setSelectedChildId(storedChildId);
        }
      } else {
        setUser(null);
        setSelectedChildId(null); // Reset selected child ID on logout
        await SecureStore.deleteItemAsync('userUID'); // Clear stored UID if user logs out
        await SecureStore.deleteItemAsync('selectedChildId'); // Clear stored child ID on logout
      }
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  // Function to update the selected child ID in the context and secure store
  const updateSelectedChildId = async (childId) => {
    setSelectedChildId(childId); // Update state
    await SecureStore.setItemAsync('selectedChildId', childId); // Store in secure storage for persistence
  };

  return (
    <UserContext.Provider value={{ user, setUser, selectedChildId, setSelectedChildId: updateSelectedChildId }}>
      {children}
    </UserContext.Provider>
  );
};
