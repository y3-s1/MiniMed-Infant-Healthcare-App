import CompleteVacciSessions from '@/components/vaccination/home/CompleteVacciSessions';
import UpcomingVacciSessions from '@/components/vaccination/home/UpcomingVacciSessions';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const VaccineHome = () => {
  const [subTab, setSubTab] = useState('UpComing Vaccinations'); // Default sub-tab

  // Render sub-tab content
  const renderSubTabContent = () => {
    switch (subTab) {
      case 'UpComing Vaccinations':
        return <UpcomingVacciSessions/>;
      case 'Complete Vaccinations':
        return <CompleteVacciSessions/>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Sub-Tab Navigation */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity
          onPress={() => setSubTab('UpComing Vaccinations')}
          style={[
            styles.subTab,
            subTab === 'UpComing Vaccinations' ? styles.activeSubTab : styles.inactiveSubTab,
          ]}
        >
          <Text style={subTab === 'UpComing Vaccinations' ? styles.activeText : styles.inactiveText}>
            UpComing Sessions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSubTab('Complete Vaccinations')}
          style={[
            styles.subTab,
            subTab === 'Complete Vaccinations' ? styles.activeSubTab : styles.inactiveSubTab,
          ]}
        >
          <Text style={subTab === 'Complete Vaccinations' ? styles.activeText : styles.inactiveText}>
            Complete Sessions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Render Sub-Tab Content */}
      <View style={styles.contentContainer}>
        {renderSubTabContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subTabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 25, // Rounded outer border for the whole tab container
    borderWidth: 1,
    borderColor: '#0b66c7',
  },
  subTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 25, // Rounded corners for individual tabs
  },
  activeSubTab: {
    backgroundColor: '#0b66c7', // Active tab background (greenish tone as in the image)
  },
  inactiveSubTab: {
  },
  activeText: {
    color: '#fff', // White text for active tab
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#0b66c7', // Greenish text for inactive tab (matching the border color)
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default VaccineHome;
