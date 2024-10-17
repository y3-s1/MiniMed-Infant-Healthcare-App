// midwivesList.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { db } from '@/config/FireBaseConfig';  // Import your Firebase config
import { collection, getDocs, query, where } from 'firebase/firestore';
import { router } from 'expo-router';

interface MidwivesListProps {
  searchQuery: string;
}

interface Midwife {
  id: string;
  name: string;
  location: string;
  joinedDate: string; // Add joinedDate field for experience calculation
  image: string;
}

const MidwivesList: React.FC<MidwivesListProps> = ({ searchQuery }) => {
  const [midwives, setMidwives] = useState<Midwife[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch midwives data from Firebase
    const fetchMidwives = async () => {
      try {
        const midwivesSnapshot = await getDocs(collection(db, 'Midwives'));
        const midwivesList: Midwife[] = midwivesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            location: data.location,
            joinedDate: data.joinedDate, // Include joinedDate
            image: data.image,
          };
        });
        setMidwives(midwivesList);
      } catch (error) {
        console.error('Error fetching midwives:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMidwives();
  }, []);

  const calculateExperience = (joinedDate: string) => {
    const joined = new Date(joinedDate);
    const currentDate = new Date();
    const experience = currentDate.getFullYear() - joined.getFullYear();
    return experience >= 0 ? experience : 0;
  };

  const filteredMidwives = midwives.filter((midwife) =>
    midwife.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading midwives data...</Text>
      ) : filteredMidwives.length > 0 ? (
        <FlatList
          data={filteredMidwives}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.midwifeCard}
              onPress={() => router.navigate({
                pathname: '/appointments/midwives/midwifeProfile',
                params: { midwifeId: item.id },  
              })}
            >
              <Image source={{ uri: item.image }} style={styles.midwifeImage} />
              <View style={styles.midwifeDetails}>
                <Text style={styles.midwifeName}>{item.name}</Text>
                <Text style={styles.midwifeInfo}>Location: {item.location}</Text>
                <Text style={styles.midwifeInfo}>Experience: {calculateExperience(item.joinedDate)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noResultsText}>No midwives found.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginBottom: 100,
  },
  midwifeCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  midwifeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  midwifeDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  midwifeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  midwifeInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MidwivesList;
