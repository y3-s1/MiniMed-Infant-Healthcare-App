import { View, Text, StyleSheet } from 'react-native';
import Header from '@/components/monitoring/header';
import React, { useState } from 'react';
import ChildList from '@/components/monitoring/childlist'; 
import AddChild from '@/components/monitoring/addchild';

export default function Tab() {
  const [selectedTab, setSelectedTab] = useState('ChildList'); // Default value

  // Render different content based on selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case 'ChildList':
        return <ChildList />; // Component to show the child list
      case 'AddChild':
        return <AddChild />; // Component to add a child
      default:
        return null; // Fallback if no case matches
    }
  };

  return (
    <View style={styles.container}>
      <Header selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Optional: Define a background color
  },
  content: {
    flex: 1, // This allows the content to fill the remaining space after the header
    padding: 16, // Optional: Add padding to content
  },
});
