import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; // For search and clear icons

const VaccSearbar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch(''); // Clear the search query in the parent
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color="#888" style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Search vaccinations..."
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          onSearch(text);
        }}
        returnKeyType="search"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClearSearch} style={styles.clearIconContainer}>
          <Ionicons name="close-circle" size={20} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // For Android shadow
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIconContainer: {
    marginLeft: 8,
  },
});

export default VaccSearbar;
