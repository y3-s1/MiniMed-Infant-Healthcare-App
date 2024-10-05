import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from '@/components/vaccination/home/Header';
import VaccineHome from '../vaccination/home';
import Vaccines from '../vaccination/vaccines';

export default function Tab() {
  const [selectedTab, setSelectedTab] = useState('Home'); // Default tab is 'Vaccination'

  // Render different content based on the selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case 'Home':
        return <VaccineHome />;
      case 'Vaccination':
        return <Vaccines/>
      case 'Analysis':
        return <Text className="p-4">This is the Analysis section.</Text>;
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
});
