import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onFilterPress: () => void; // Function to call when filter icon is pressed
}

const SearchBar: React.FC<SearchBarProps> = ({ onFilterPress }) => (
  <View style={styles.searchContainer}>
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="#aaa" />
      <TextInput placeholder="Search Events" style={styles.searchInput} />
      <TouchableOpacity onPress={onFilterPress}>
        <Ionicons name="options-outline" size={20} color="#aaa" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  searchContainer: {
    padding: 10,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    color: '#333',
  },
});

export default SearchBar;
