import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MidwivesSubHome from '../appointments/midwives/index';
import AppointmentsSubHome from '../appointments/appointments/index'
import Header from '@/components/appointments/common/header';

export default function Tab() {

  const [selectedTab, setSelectedTab] = useState('Midwives'); // Default tab is 'midwives'

  // Render different content based on the selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case 'Midwives':
        return <MidwivesSubHome />;
      case 'Appointments':
        return <AppointmentsSubHome />;
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
