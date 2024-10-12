import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from '@/config/FireBaseConfig';
import { UserContext } from '@/contexts/userContext'; // Assume you have a user context to get the childId
import { router } from 'expo-router';

interface VaccinationRecord {
  id: string;
  vaccineName: string;
  scheduledDate: string;
  status: string;
  administeredDate: string | null;
  imageUrl: string | null; // Include imageUrl for vaccine
  location: string | null;
}

const UpcomingVacciSessions = () => {
  const [upcomingVaccinations, setUpcomingVaccinations] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Get childId from the context
  const { selectedChildId } = useContext(UserContext); // Assuming childId is coming from context

  useEffect(() => {
    const fetchUpcomingVaccinations = async () => {
      try {
        const vaccinationRecordsQuery = query(
          collection(db, 'VaccinationRecords'),
          where('childId', '==', selectedChildId),
          where('status', '==', 'Scheduled')
        );

        const querySnapshot = await getDocs(vaccinationRecordsQuery);
        const upcomingVacs: VaccinationRecord[] = await Promise.all(
          querySnapshot.docs.map(async (document) => {
            const recordData = document.data();
            let imageUrl = null;
            if (recordData.vaccineId) {
              const vaccineDocRef = doc(db, 'VaccinationSchedules', recordData.vaccineId);
              const vaccineDocSnapshot = await getDoc(vaccineDocRef);
              if (vaccineDocSnapshot.exists()) {
                imageUrl = vaccineDocSnapshot.data().imageUrl;
              }
            }
            return {
              id: document.id,
              vaccineName: recordData.vaccineName,
              scheduledDate: recordData.scheduledDate,
              status: recordData.status,
              administeredDate: recordData.administeredDate,
              imageUrl,
              vaccineId: recordData.vaccineId
            };
          })
        );
        setUpcomingVaccinations(upcomingVacs);
      } catch (error) {
        console.error('Error fetching upcoming vaccinations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedChildId) {
      fetchUpcomingVaccinations();
    }
  }, [selectedChildId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#3b82f6" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upcoming Vaccinations</Text>
      {upcomingVaccinations.length === 0 ? (
        <Text style={styles.noDataText}>No upcoming vaccinations found.</Text>
      ) : (
        <FlatList
          data={upcomingVaccinations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => {
                router.navigate({
                  pathname: '/vaccination/vaccineSessionDetails',
                  params: { vaccinationRecord: item.id },
                });
              }}
            >
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.vaccineImage} />
              )}
              <View style={styles.cardContent}>
                <Text style={styles.vaccineName}>{item.vaccineName}</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Scheduled Date: </Text>
                  <Text style={styles.value}>{item.scheduledDate}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Location: </Text>
                  <Text style={styles.value}>{item.administeredDate ? item.location : 'Not yet'}</Text>
                </View>
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
    backgroundColor: '#f0f0f0',
    width: '100%'
  },
  header: {
    fontSize: 22,
    marginBottom: 25,
  },
  noDataText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    height:130,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6', // Accent color for the premium look
    overflow: 'hidden',
  },
  vaccineImage: {
    width: 90,
    height: '100%',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#3b82f6', // Blue border for a premium look
  },
  cardContent: {
    flex: 1,
    padding: 15,
  },
  vaccineName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UpcomingVacciSessions;
