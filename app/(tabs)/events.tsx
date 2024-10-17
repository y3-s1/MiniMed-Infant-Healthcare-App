import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UpcomingEvents from '../events/upcomingEvents/index';
import CompletedEvents from '../events/completedEvents/index'
import Header from '@/components/events/common/header';

export default function Tab() {

  const [selectedTab, setSelectedTab] = useState('upcomingEvents'); // Default tab is 'midwives'

  // Render different content based on the selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case 'upcomingEvents':
        return <UpcomingEvents />;
      case 'completedEvents':
        return <CompletedEvents/>;
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
