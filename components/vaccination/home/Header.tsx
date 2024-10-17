import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { UserContext } from '@/contexts/userContext'; // Use the updated UserContext
import { router } from 'expo-router';

interface HeaderProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedTab, setSelectedTab }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [children, setChildren] = useState([]);
  const { user, selectedChildId, setSelectedChildId } = useContext(UserContext); // Access selected child ID and update function from context
  const [selectedChild, setSelectedChild] = useState('Sandeep'); // Default child name

  // Fetch children from Firebase
  const fetchChildren = async () => {
    try {
      const userDocId = user.uid; // Get the logged-in user's ID from context
      const childrenSnapshot = await getDocs(
        collection(db, `Users/${userDocId}/Childrens`)
      );
      const childrenList = childrenSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChildren(childrenList);

      // Set the initial child based on the selectedChildId in context or the first child in the list
      if (selectedChildId) {
        const initialChild = childrenList.find((child) => child.id === selectedChildId);
        if (initialChild) setSelectedChild(initialChild.name);
      } else if (childrenList.length > 0) {
        setSelectedChild(childrenList[0].name);
        setSelectedChildId(childrenList[0].id);
      }
    } catch (error) {
      console.error('Error fetching children: ', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  // Handle child selection and update both state and context
  const handleChildSelection = (childName, childId) => {
    setSelectedChild(childName); // Update the local state
    setSelectedChildId(childId); // Update the selected child ID in context and secure store
    setModalVisible(false);
  };

  return (
    <View className="h-60 bg-blue-400 rounded-b-3xl py-9">
      {/* Top section with app logo and icons */}
      <View className="px-4 py-4 flex-row justify-between items-center">
        {/* App logo placeholder */}
        <View>
          <Text className="text-lg font-semibold text-gray-800">App Logo</Text>
        </View>

        {/* Child name and dropdown arrow */}
        <View className="flex-row items-center justify-center">
          <Text className="text-2xl font-semibold text-white">{selectedChild}</Text>
          <TouchableOpacity className="ml-2" onPress={() => setModalVisible(true)}>
            <Ionicons name="chevron-down" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Notification and profile icons */}
        <View className="flex-row space-x-4">
          <TouchableOpacity onPress={() => router.push('/vaccination/notification')}>
            <Ionicons name="notifications" size={25} color="black" />
            {/* Notification count badge */}
            <View className="absolute -top-2 -right-3 bg-red-500 rounded-full h-4 w-4 justify-center items-center">
              <Text className="text-white text-xs">9</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <MaterialCommunityIcons name="account-outline" size={25} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom navigation section */}
      <View className="flex-row justify-center mt-14 bg-blue-300 w-3/5 mx-auto">
        {/* Navigation buttons */}
        <TouchableOpacity
          onPress={() => setSelectedTab('Home')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'Home' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Home' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Vaccination')}
          className={`mx-4 px-6 py-2 rounded-full ${
            selectedTab === 'Vaccination' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Vaccination' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Vaccination
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedTab('Analysis')}
          className={`px-6 py-2 rounded-full ${
            selectedTab === 'Analysis' ? 'bg-white' : 'bg-blue-300'
          }`}
        >
          <Text
            className={`${
              selectedTab === 'Analysis' ? 'text-blue-500' : 'text-white'
            } font-poppins`}
          >
            Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal to display children list */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Child</Text>
            <FlatList
              data={children}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.childButton}
                  onPress={() => handleChildSelection(item.name, item.id)} // Pass child name and ID
                >
                  <Text style={styles.childText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.118)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  childButton: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  childText: {
    fontSize: 16,
  },
  closeButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  closeText: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default Header;
