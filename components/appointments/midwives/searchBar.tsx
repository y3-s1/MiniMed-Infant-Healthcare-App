import React from 'react';
import { SearchBar as RNEUI_SearchBar } from '@rneui/themed';
import { StyleSheet } from 'react-native';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <RNEUI_SearchBar
      placeholder="Search for midwives..."
      value={searchQuery}
      onChangeText={setSearchQuery}
      platform="default"  // Apply platform-specific styling if needed
      lightTheme  // Apply the light theme
      round  // Makes the search bar round
      containerStyle={styles.containerStyle}
      inputContainerStyle={styles.inputContainerStyle}
      inputStyle={styles.inputStyle}
      placeholderTextColor="#888"  // Light theme placeholder color
      searchIcon={{ color: '#333' }}  // Customize search icon color
      clearIcon={{ color: '#333' }}  // Customize clear icon color
    />
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: '#f5f5f5',  // Light background color
    borderTopWidth: 0,  // Remove the border at the top
    borderBottomWidth: 0,  // Remove the border at the bottom
    borderRadius: 10,  // Optional: for rounded corners
  },
  inputContainerStyle: {
    backgroundColor: '#fff',  // White input background
    borderRadius: 20,  // Make the input field round
    borderColor: '#ddd',  // Light border color
    borderWidth: 1,
  },
  inputStyle: {
    color: '#333',  // Text color for light theme
    fontSize: 16,
  },
});

export default SearchBar;
