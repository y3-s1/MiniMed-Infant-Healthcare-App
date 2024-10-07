import React from 'react';
import { View, Text, FlatList, Image, StyleSheet, Dimensions } from 'react-native';
import { Button } from '@rneui/themed'; // Import the Button component from RNE

// Define prop types
interface MidwivesListProps {
  searchQuery: string;
}

// Mock midwives data
const midwivesData = [
  {
    id: '1',
    name: 'Alice Smith',
    location: 'New York',
    experience: '5 years',
    image: 'https://via.placeholder.com/100', // Replace with actual image URL
  },
  {
    id: '2',
    name: 'Megan Johnson',
    location: 'Los Angeles',
    experience: '7 years',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '3',
    name: 'Sophia Brown',
    location: 'Chicago',
    experience: '3 years',
    image: 'https://via.placeholder.com/100',
  },
  {
    id: '4',
    name: 'Emily Davis',
    location: 'Houston',
    experience: '6 years',
    image: 'https://via.placeholder.com/100',
  },
];

const MidwivesList: React.FC<MidwivesListProps> = ({ searchQuery }) => {
  // Filter midwives based on search query
  const filteredMidwives = midwivesData.filter(midwife =>
    midwife.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle booking
  const handleBooking = (midwifeName: string) => {
    console.log(`Booking midwife: ${midwifeName}`);
    // Add booking logic here (e.g., navigate to booking page)
  };

  return (
    <View style={styles.container}>
      {filteredMidwives.length > 0 ? (
        <FlatList
        style={{ height: Dimensions.get('window').height / 2 }} // Ensure FlatList has a defined height
        data={filteredMidwives}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.midwifeCard}>
            {/* Midwife Image */}
            <Image source={{ uri: item.image }} style={styles.midwifeImage} />
      
            {/* Midwife Details */}
            <View style={styles.midwifeDetails}>
              <Text style={styles.midwifeName}>{item.name}</Text>
              <Text style={styles.midwifeInfo}>Location: {item.location}</Text>
              <Text style={styles.midwifeInfo}>Experience: {item.experience}</Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}  // Hide the scroll bar
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
  },
  midwifeCard: {
    flexDirection: 'row',  // Align image and details horizontally
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,  // For Android shadow
  },
  midwifeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,  // Circular image
    marginRight: 15,  // Add some space between the image and the text
  },
  midwifeDetails: {
    flex: 1,  // Take up remaining space
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
  bookButton: {
    backgroundColor: '#007bff',  // Blue button color
    borderRadius: 20,  // Rounded button
    paddingHorizontal: 20,  // Add padding to the button horizontally
    paddingVertical: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MidwivesList;
