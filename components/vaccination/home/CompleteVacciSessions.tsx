import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig'; // Firestore instance
import { UserContext } from '@/contexts/userContext'; // Assume you have a user context to get the childId
import { MaterialIcons } from '@expo/vector-icons'; // Import icons for better visual representation
import { TouchableOpacity } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import SearchBar from '../searchBar/VaccSearbar'; // Assuming the SearchBar is in the same directory

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  scheduledDate: string;
  status: string;
  administeredDate: string | null;
  imageUrl: string | null; // Include imageUrl for vaccine
}

const CompleteVacciSessions = () => {
  const [completedVaccinations, setCompletedVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredVaccinations, setFilteredVaccinations] = useState<VaccinationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  
  // Get childId from the context
  const { user, selectedChildId } = useContext(UserContext); // Assuming childId is coming from context

  useEffect(() => {
    const fetchCompletedVaccinations = async () => {
      try {
        // Query to get all completed vaccinations for the selected child based on childId
        const vaccinationRecordsQuery = query(
          collection(db, 'VaccinationRecords'),
          where('childId', '==', selectedChildId), // Filter by childId
          where('status', '==', 'Completed') // Filter only completed vaccinations
        );

        const querySnapshot = await getDocs(vaccinationRecordsQuery);
        const completedVacs: VaccinationRecord[] = await Promise.all(
          querySnapshot.docs.map(async (document) => {
            const recordData = document.data();

            // Fetch the vaccine imageUrl using vaccineId from the VaccinationSchedules collection
            let imageUrl = null;
            if (recordData.vaccineId) {
              const vaccineDocRef = doc(db, 'VaccinationSchedules', recordData.vaccineId);
              const vaccineDocSnapshot = await getDoc(vaccineDocRef);
              if (vaccineDocSnapshot.exists()) {
                imageUrl = vaccineDocSnapshot.data().imageUrl; // Assuming the field is imageUrl
              }
            }

            return {
              id: document.id,
              vaccineName: recordData.vaccineName,
              scheduledDate: recordData.scheduledDate,
              status: recordData.status,
              administeredDate: recordData.administeredDate,
              imageUrl, // Add the image URL to the vaccination record
            };
          })
        );

        setCompletedVaccinations(completedVacs);
        setFilteredVaccinations(completedVacs); // Set initial filtered vaccinations
      } catch (error) {
        console.error('Error fetching completed vaccinations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedChildId) {
      fetchCompletedVaccinations();
    }
  }, [selectedChildId]);

  // Filter vaccinations based on the search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredVaccinations(completedVaccinations); // Reset if query is empty
    } else {
      const filtered = completedVaccinations.filter((item) =>
        item.vaccineName.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredVaccinations(filtered);
    }
  };

  if (loading) {
    return <Text>Loading completed vaccinations...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Completed Vaccinations</Text>
      
      {/* Search Bar Component */}
      <View className='p-5'>
      <SearchBar onFilterPress={() => console.log('Filter pressed')} onSearch={handleSearch} />
      </View>

      {filteredVaccinations.length === 0 ? (
        <Text style={styles.noDataText}>No completed vaccinations found.</Text>
      ) : (
        <FlatList
          data={filteredVaccinations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => {
                // Navigate to CustomerVaccinationDetails page with the selected item data
                router.navigate({
                  pathname: '/vaccination/vaccineSessionDetails',
                  params: { vaccinationRecord: item.id },
                });
              }}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.CompleteVacciImage} />
              <View style={styles.cardHeader}>
                <Text style={styles.vaccineName}>{item.vaccineName}</Text>
              </View>
              
              <View style={styles.cardRow}>
                <View className="flex-row">
                  <MaterialIcons name="event" size={20} color="#2196F3" />
                  <Text style={styles.label}>Scheduled Date: </Text>
                </View>
                <Text style={styles.value}>{item.scheduledDate}</Text>
              </View>

              <View style={styles.cardRow}>
                <View className="flex-row">
                  <MaterialIcons name="schedule" size={20} color="#FF9800" />
                  <Text style={styles.label}>Administered Date: </Text>
                </View>
                <Text style={styles.value}>
                  {item.administeredDate ? item.administeredDate : 'Not available'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    fontSize: 22,
    marginBottom: 15,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  CompleteVacciImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  card: {
    width:'90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  vaccineName: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 5,
    marginLeft: 8,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
});

export default CompleteVacciSessions;
