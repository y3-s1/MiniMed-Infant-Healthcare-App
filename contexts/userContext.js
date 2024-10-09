// src/contexts/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/FireBaseConfig'; // Update the path to your Firebase config

// Create User Context
export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Listen for changes in authentication state and store user info in context and secure store
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user); // Set user in context

        // Store user UID securely for reuse across pages
        await SecureStore.setItemAsync('userUID', user.uid);
      } else {
        setUser(null);
        await SecureStore.deleteItemAsync('userUID'); // Clear stored UID if user logs out
      }
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
