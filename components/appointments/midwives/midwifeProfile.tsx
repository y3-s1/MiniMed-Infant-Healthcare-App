import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, VirtualizedList } from 'react-native';
import { db } from '@/config/FireBaseConfig';  // Firebase configuration
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

interface MidwifeProfileProps {
  midwifeId: string;
}

const areas = [
  'Malabe', 'Gampaha', 'Kaduwela', 'Biyagama', 'Kelaniya', 'Baththaramulla', 'Rajagiriya',
];

const clinics = [
  'Kaduwela', 'Malabe', 'Nugegoda', 'Biyagama', 'Rajagiriya', 'Kelaniya',
];

const MidwifeProfile: React.FC<MidwifeProfileProps> = ({ midwifeId }) => {
  const navigation = useNavigation();
  const [midwife, setMidwife] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);  // State to manage full description view
  const [sessionType, setSessionType] = useState('Home Visit');
  const [selectedLocation, setSelectedLocation] = useState('Malabe');
  const [midwifeSessions, setMidwifeSessions] = useState<any[]>([]);
  const [filteredMidwifeSessions, setFilteredMidwifeSessions] = useState<any[]>([]);


  useEffect(() => {

    navigation.setOptions({ title: 'Midwives' });
    const fetchMidwifeData = async () => {
      try {
        // Fetch Midwife document
        const midwifeDocRef = doc(db, 'Midwives', midwifeId);
        const midwifeSnapshot = await getDoc(midwifeDocRef);

        if (midwifeSnapshot.exists()) {
          setMidwife(midwifeSnapshot.data());

          // Fetch MidwifeSessions sub-collection
          const sessionsCollectionRef = collection(midwifeDocRef, 'MidwifeSessions');
          const sessionSnapshot = await getDocs(sessionsCollectionRef);

          // Map through the retrieved sessions and store them
          const sessions = sessionSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMidwifeSessions(sessions);
        } else {
          console.log('Midwife not found');
        }
      } catch (error) {
        console.error('Error fetching midwife or sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMidwifeData();
  }, [midwifeId]);



  useEffect(() => {
    const filteredSessions = midwifeSessions.filter(
      (session) => session.sessionType === sessionType && session.location === selectedLocation
    );
    setFilteredMidwifeSessions(filteredSessions);
  }, [midwifeSessions, sessionType, selectedLocation]);
  



  const locations = sessionType === 'Home Visit' ? areas : clinics;
  

  // Handle location selection for areas or clinics based on session type
  const LocationSelector = () => {
    const getItem = (_data: unknown, index: number) => ({
      id: locations[index],
      title: locations[index],
    });

    const getItemCount = (_data: unknown) => locations.length;

    return (
        <SafeAreaView style={styles.locationSelectorContainer} edges={['left', 'right', 'bottom']}>
        <VirtualizedList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={null}
          initialNumToRender={4}
          getItem={getItem}
          getItemCount={getItemCount}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.locationSlot, selectedLocation === item.title ? styles.selectedLocationSlot : null]}
              onPress={() => setSelectedLocation(item.title)}
            >
              <Text style={selectedLocation === item.title ? styles.selectedText : styles.locationText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
      
    );
  };




  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-600">Loading midwife profile...</Text>
      </View>
    );
  }

  if (!midwife) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-red-500">Midwife not found.</Text>
      </View>
    );
  }

  return (
    <View className="p-5">
      {/* Flexbox row to display image and text */}
      <View className="flex-row mb-5 w-full">
        <Image
          source={{ uri: midwife.image }}
          className="w-36 h-36 rounded-full"
        />
        <View className="ml-4 justify-center flex-1">
          <Text className="text-2xl font-bold text-gray-800">{midwife.name}</Text>
          <Text className="text-lg text-gray-600 mt-2">{midwife.province}</Text>
          <Text className="text-md text-gray-500 mt-2">{/* Add experience value */} Years Experience</Text>
        </View>
      </View>
      <View>
        {/* Conditional description rendering */}
        <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 5}>
          {midwife.description}
        </Text>

        {/* See More / See Less button */}
        {midwife.description && (
          <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
            <Text style={styles.seeMoreText}>
              {showFullDescription ? 'See Less' : 'See More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Session Type Toggle */}
      <View className="bg-blue-400 my-2 mx-8 flex justify-center rounded-lg">
        <Text className='ml-3 mt-3 text-lg font-semibold text-white'>Type</Text>
        <View className="flex-row justify-center mb-5 mt-1 bg-blue-300 w-3/6 mx-auto rounded-full">
          <TouchableOpacity
            onPress={() => setSessionType('Home Visit')}
            className={`px-6 py-2 rounded-full ${
              sessionType === 'Home Visit' ? 'bg-white' : 'bg-blue-300'
            }`}
          >
            <Text className={`${sessionType === 'Home Visit' ? 'text-blue-500' : 'text-white'} font-poppins`}>
              Home Visit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setSessionType('Clinic')}
            className={`mx-4 px-6 py-2 rounded-full ${
              sessionType === 'Clinic' ? 'bg-white' : 'bg-blue-300'
            }`}
          >
            <Text className={`${sessionType === 'Clinic' ? 'text-blue-500' : 'text-white'} font-poppins`}>
              Clinic
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Location Selection (Areas or Clinics) */}
      <Text className="text-lg my-2">{sessionType === 'Home Visit' ? 'Select Area' : 'Select Clinic'}</Text>
      <LocationSelector />

      {/* Create Session Button */}
      <TouchableOpacity className="bg-blue-500 p-4 rounded-lg mt-7 items-center mb-5"
        onPress={() => router.navigate({
          pathname: '/appointments/midwives/addAppointment',
          params: { 
            midwifeId: midwifeId, 
            sessionType: sessionType, 
            selectedLocation: selectedLocation, 
            filteredMidwifeSessions: JSON.stringify(filteredMidwifeSessions) // Convert to string 
          },  
        })}
      >
        <Text className="text-white text-lg">Search Availability</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MidwifeProfile;

const styles = StyleSheet.create({
  description: {
    fontSize: 16,
    fontFamily: 'poppins',
    marginBottom: 2,
    lineHeight: 24,
  },
  seeMoreText: {
    color: '#0d7ef7',
    fontSize: 16,
    marginBottom: 20,
  },
  selectedText: {
    fontSize: 18,
    color: 'white',
  },
  locationSelectorContainer: {
    marginBottom: 16,
  },
  locationSlot: {
    backgroundColor: '#ffffff',
    height: 60,
    width: 120,
    justifyContent: 'center',
    marginHorizontal: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  selectedLocationSlot: {
    backgroundColor: '#2196F3',
  },
  locationText: {
    fontSize: 16,
    color: 'black',
  },
});
