import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Button, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/FireBaseConfig'; // Firestore instance

const CustomerVacciSessionDetails = ({ vaccinationRecord }) => {
  const [vaccineDetails, setVaccineDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordDetails, setRecordDetails] = useState(null); // To hold the fetched record details
  const [showFullDescription, setShowFullDescription] = useState(false); // State to control description expansion

  console.log('vaccinationRecord', vaccinationRecord);

  useEffect(() => {
    const fetchVaccinationDetails = async () => {
      try {
        // Fetch the vaccination record details
        const recordDocRef = doc(db, 'VaccinationRecords', vaccinationRecord);
        const recordDocSnapshot = await getDoc(recordDocRef);
        
        if (recordDocSnapshot.exists()) {
          const recordData = recordDocSnapshot.data();
          setRecordDetails(recordData); // Set the record details

          // Now fetch the vaccine details using vaccineId
          const vaccineDocRef = doc(db, 'VaccinationSchedules', recordData.vaccineId);
          const vaccineDocSnapshot = await getDoc(vaccineDocRef);

          if (vaccineDocSnapshot.exists()) {
            setVaccineDetails(vaccineDocSnapshot.data()); // Set vaccine details
          } else {
            console.error('No vaccine document found');
          }
        } else {
          console.error('No vaccination record found');
        }
      } catch (error) {
        console.error('Error fetching vaccination data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinationDetails();
  }, [vaccinationRecord]);

  if (loading) {
    return <Text>Loading vaccine details...</Text>;
  }

  // Function to handle Confirm Coming
  const handleConfirmComing = () => {
    Alert.alert('Confirmed', 'You have confirmed your attendance for this vaccination.');
    // Add logic to update the vaccination record status if necessary
  };

  // Function to handle Reschedule Request
  const handleRequestReschedule = () => {
    Alert.alert('Reschedule Requested', 'You have requested to reschedule this vaccination.');
    // Add logic to handle rescheduling if necessary
  };

  // Display dummy data if certain values are missing
  const defaultStartTime = recordDetails?.startTime || 'To be confirmed';
  const defaultEndTime = recordDetails?.endTime || 'To be confirmed';
  const defaultLocation = recordDetails?.location || 'No location available';

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.header}>Vaccination Details</Text>

        <View className='flex-row justify-between'>
          <View>
            <Text style={styles.label}>Vaccine Name:</Text>
            <Text style={styles.vaccineName}>{recordDetails?.vaccineName || 'Unknown Vaccine'}</Text>

            <Text style={styles.label}>Scheduled Date:</Text>
            <Text style={styles.details}>{recordDetails?.scheduledDate || 'To be confirmed'}</Text>

            <Text style={styles.label}>Start Time:</Text>
            <Text style={styles.details}>{defaultStartTime}</Text>

            <Text style={styles.label}>End Time:</Text>
            <Text style={styles.details}>{defaultEndTime}</Text>

            <Text style={styles.label}>Location:</Text>
            <Text style={styles.details}>{defaultLocation}</Text>

            <Text style={styles.label}>Administered Date:</Text>
            <Text style={styles.details}>{recordDetails?.administeredDate || 'Not administered yet'}</Text>
          </View>

          {vaccineDetails && (
            <Image source={{ uri: vaccineDetails.imageUrl }} style={styles.vaccineImage} />
          )}
        </View>

        <Text style={styles.label}>Vaccine Details:</Text>
        <Text
          style={styles.description}
          numberOfLines={showFullDescription ? 0 : 5} // 0 means no limit on lines
        >
          {vaccineDetails?.vaccineDetails || 'No description available.'}
        </Text>

        {/* Toggle See More/See Less Button */}
        <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
          <Text style={styles.seeMoreText}>
            {showFullDescription ? 'See Less' : 'See More'}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        {/* <View style={styles.buttonContainer}>
          <Button title="Confirm Coming" onPress={handleConfirmComing} color="#4CAF50" />
          <Button title="Request Reschedule" onPress={handleRequestReschedule} color="#FF9800" />
        </View> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#444',
  },
  vaccineName: {
    fontSize: 18,
    marginBottom: 5,
    color: '#2c3e50',
  },
  vaccineImage: {
    width: '50%',
    height: 350,
    borderRadius: 20,
    marginVertical: 15,
    alignSelf: 'center',
  },
  details: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#333',
    marginVertical: 10,
  },
  seeMoreText: {
    color: '#1E90FF',
    fontSize: 16,
    textAlign: 'right',
    marginVertical: 5,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default CustomerVacciSessionDetails;
