import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '@/components/vaccination/home/Header';
import VaccineHome from '../vaccination/home';
import Vaccines from '../vaccination/vaccines';
import AnalysisHome from '../vaccination/analysis';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { collection, collectionGroup, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { UserContext } from '@/contexts/userContext';

export default function Tab() {
  const [selectedTab, setSelectedTab] = useState('Home'); // Default tab is 'Home'
  const [reminderCount, setReminderCount] = useState(0);  // State for storing reminder count

  const { user, selectedChildId } = useContext(UserContext);

  useEffect(() => {
    fetchReminderCount();  // Fetch reminders on mount
  }, [selectedChildId]);

  const fetchReminderCount = async () => {
    try {
      // Assuming `selectedChildId` is available in some way (like from context)
      const vaccinationSessionsQuery = query(
        collectionGroup(db, 'VaccinationSessions'),
        where('selectedParticipants', 'array-contains', selectedChildId)
      );
      const querySnapshot = await getDocs(vaccinationSessionsQuery);

      let count = 0;
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
  
        // Skip completed sessions
        if (data.status === 'complete') {
          continue;
        }
  
        // Query the vaccination records for this session
        const vaccinationRecordsQuery = query(
          collection(db, 'VaccinationRecords'),
          where('vaccinationSessionId', '==', docSnapshot.id),
          where('childId', '==', selectedChildId)
        );
        const vaccinationRecordsSnapshot = await getDocs(vaccinationRecordsQuery);
  
        // Skip sessions with existing vaccination records
        if (!vaccinationRecordsSnapshot.empty) {
          continue;
        }

        count++;
    }

      setReminderCount(count);  // Update the state with reminder count

    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'Home':
        return <GestureHandlerRootView style={{ flex: 1 }}>
          <VaccineHome />
        </GestureHandlerRootView>;
      case 'Vaccination':
        return <Vaccines />;
      case 'Analysis':
        return <AnalysisHome />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with tabs */}
      <Header selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Render different content based on selected tab */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* Fixed Reminders Button with count */}
      <TouchableOpacity 
        style={styles.remindersButton}
        onPress={() => router.navigate('/vaccination/reminders')}
      >
        <Text style={styles.buttonText}>Reminders</Text>
        {reminderCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{reminderCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  remindersButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#0b66c7',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countBadge: {
    backgroundColor: 'red',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
