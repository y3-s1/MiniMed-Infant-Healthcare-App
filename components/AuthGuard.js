import React, { useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { auth } from '@/config/FireBaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.replace('/login/sign-in'); // Redirect to the sign-in page
      }
      setLoading(false); // Stop loading once we know the user's status
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <>{user ? children : null}</>; // Only render children if authenticated
};

export default AuthGuard;
