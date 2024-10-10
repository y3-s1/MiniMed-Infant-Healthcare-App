import { View, Text, Image, Button, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig';
import { useNavigation } from 'expo-router';
import { UserContext } from '@/contexts/userContext';

// Define the prop type for the vaccine details
interface VaccinatonDetailProps {
  vaccine: any;
}

// Define the type for vaccineDetails, allow 'undefined' as the type
interface VaccineDetails {
  vaccineName?: string;
  ageDue?: string;
  vaccineDetails?: string;
  imageUrl?: string;  // You can add an image URL field
}

const VaccinatonDetailAll: React.FC<VaccinatonDetailProps> = ({ vaccine }) => {
  const [vaccineDetails, setVaccineDetails] = useState<VaccineDetails | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);  // State to manage full description view

  const { user, selectedSchilId } = useContext(UserContext);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: '',
    });

    fetchVaccinationData();
  }, []);

  const fetchVaccinationData = async () => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'VaccinationSchedules', vaccine));
      const data = docSnap.data();
      setVaccineDetails(data ?? {});
    } catch (error) {
      console.error('Error fetching vaccination data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text className='m-auto fontfamily: poppins text-xl mt-52'>Loading vaccine details...</Text>
      ) : vaccineDetails ? (
        <>
          {/* Vaccine image */}
          <Image
            source={{ uri: vaccineDetails.imageUrl }}  // Make sure the imageUrl is valid
            style={styles.vaccineImage}
            resizeMode="cover"
          />

          <View className='p-5'>
            <Text style={styles.vaccineName}>{vaccineDetails.vaccineName}</Text>

            {/* Description section */}
            <Text style={styles.sectionTitle}>DESCRIPTION</Text>
            <Text style={styles.ageInfo}>{vaccineDetails.ageDue}</Text>

            {/* Conditional description rendering */}
            <Text style={styles.description} numberOfLines={showFullDescription ? undefined : 8}>
              {vaccineDetails.vaccineDetails}
            </Text>

            {/* See More / See Less button */}
            {vaccineDetails.vaccineDetails && (
              <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                <Text style={styles.seeMoreText}>
                  {showFullDescription ? 'See Less' : 'See More'}
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </>
      ) : (
        <Text>Vaccine details not found.</Text>
      )}
    </View>
  );
};

export default VaccinatonDetailAll;

// Styles to match the design
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom:40,
    flex: 1,
  },
  vaccineName: {
    fontSize: 28,
    fontFamily: 'poppins-medium',
    textAlign: 'center',
    marginBottom: 20,
  },
  vaccineImage: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 60,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'poppins-medium',
    marginBottom: 10,
  },
  ageInfo: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
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
});
