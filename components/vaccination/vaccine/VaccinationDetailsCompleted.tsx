import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { useNavigation } from 'expo-router';
import { UserContext } from '@/contexts/userContext';

interface VaccinationDetailCompleteProps {
  vaccine: any; // Replace 'any' with a more specific type if needed
}

  const VaccinationDetailsCompleted: React.FC<VaccinationDetailCompleteProps> = ({ vaccine }) => {
  const [vaccineDetails, setVaccineDetails] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<number>(0); // Custom tab index
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false); // Track description state

  const { user , selectedChildId } = useContext(UserContext);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
    });

    fetchVaccinationData();
    console.log(vaccineDetails);
  }, []);

  const fetchVaccinationData = async () => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'VaccinationSchedules', vaccine));
      const data = docSnap.data();

      const vaccinationRecordsRef = collection(db, 'VaccinationRecords');

  // Create the query with multiple filters: userId, childId, and vaccineId
      const vaccinationRecordsQuery = query(
        vaccinationRecordsRef,
        where('UserId', '==', user.uid),
        where('childId', '==', selectedChildId),
        where('vaccineId', '==', vaccine)
      );

      console.log('vaccine', vaccine)

      const childDoc = await getDocs(vaccinationRecordsQuery);

      const childData = childDoc.docs;

      console.log('childData', childData)

      setVaccineDetails({
        ...data,
        ...childData,
      });
      
    } catch (error) {
      console.error('Error fetching vaccination data:', error);
    } finally {
      setLoading(false);
      
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Vaccine Image */}
      <Image
        source={{ uri: vaccineDetails?.imageUrl || 'https://link-to-default-image.com' }}
        style={styles.vaccineImage}
      />

      <View className='p-5'>
        {/* Vaccine Title and Description */}
        <View>
          <Text style={styles.vaccineTitle}>{vaccineDetails?.vaccineName || 'Pentavalent 2'}</Text>
          <Text style={styles.section} ><Text style={styles.sectionContent}>Age Period:     </Text>{vaccineDetails?.ageDue || 'Pentavalent 2'}</Text>
          <Text style={styles.section} ><Text style={styles.sectionContent} >Scheduled Date:     </Text>{vaccineDetails?.scheduledDate || 'Pentavalent 2'}</Text>
          <Text style={styles.section} ><Text style={styles.sectionContent} >Administrated Date:     </Text>{vaccineDetails?.administeredDate || 'Pentavalent 2'}</Text>
          <Text style={styles.section} ><Text style={styles.sectionContent} >Side Effects:     </Text>{vaccineDetails?.sideEffects || 'Pentavalent 2'}</Text>
          <Text style={styles.section} ><Text style={styles.sectionContent} >Status:     </Text>{vaccineDetails?.status || 'Pentavalent 2'}</Text>
          <Text style={styles.section} ><Text style={styles.sectionContent} >National Health GuideLines:     </Text>{vaccineDetails?.nationalHealthGuidelines || 'Pentavalent 2'}</Text>
          <Text style={styles.sectionTitle}>DESCRIPTION</Text>
          
          {/* Conditional description rendering */}
          <Text style={styles.descriptionText} numberOfLines={showFullDescription ? undefined : 3}>
            {vaccineDetails?.vaccineDetails || 'No description available.'}
          </Text>

          {/* See More / See Less Button */}
          {vaccineDetails?.vaccineDetails && vaccineDetails?.vaccineDetails.length > 0 && (
            <TouchableOpacity className='pb-5'
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.seeMoreText}>
                {showFullDescription ? 'See Less' : 'See More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Custom Tab Implementation */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 0 && styles.activeTabButton]}
            onPress={() => setSelectedTab(0)}
          >
            <Text style={selectedTab === 0 ? styles.activeTabText : styles.tabText}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === 1 && styles.activeTabButton]}
            onPress={() => setSelectedTab(1)}
          >
            <Text style={selectedTab === 1 ? styles.activeTabText : styles.tabText}>Emergency Allergy</Text>
          </TouchableOpacity>
        </View>

        {/* Conditionally Render Tab Content */}
        {selectedTab === 0 && (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.input}
              placeholder="Write details about symptoms..."
              value={vaccineDetails?.notes || ''}
              multiline
            />
          </View>
        )}
        {selectedTab === 1 && (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Name:</Text>
            <TextInput style={styles.input} value={vaccineDetails?.emergencyAllergyName || 'James...'} />

            <Text style={styles.label}>Allergy Date:</Text>
            <TextInput style={styles.input} value={vaccineDetails?.emergencyAllergyDate || '00/00'} />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={styles.input}
              placeholder="Write details about symptoms..."
              value={vaccineDetails?.emergencyAllergyDescription || ''}
              multiline
            />
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={() => console.log('Submitted')}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};

export default VaccinationDetailsCompleted;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  vaccineTitle: {
    fontSize: 24,
    fontFamily: 'poppins-medium',
    marginBottom: 10,
  },
  vaccineImage: {
    width: '100%',
    height: 400,
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-medium',
    marginBottom: 5,
    marginTop:18,
  },
  section: {
    fontFamily: 'poppins-medium',
    fontSize:18,
  },
  sectionContent: {
    fontFamily: 'poppins-medium',
    color:'#666',
    fontSize:15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'poppins-medium',
    marginTop: 10,
  },
  seeMoreText: {
    color: '#0d7ef7',
    fontSize: 14,
    marginTop: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e7e5e595',
    borderTopRightRadius:20,
    borderBottomColor:'#0d7ef7',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth:1,
  },
  tabText: {
    color: '#434343',
  },
  activeTabText: {
    color:'#0d7ef7',
  },
  tabContent: {
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    borderRadius: 20,
    backgroundColor: '#0d7ef7',
    padding: 10,
    alignItems: 'center',  // Center the text inside the button
  },
  buttonText: {
    color: '#fff',  // Text color
    fontSize: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
});
