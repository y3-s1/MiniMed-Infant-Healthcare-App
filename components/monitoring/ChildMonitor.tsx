import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Import Firestore methods
import Childmonitorheader from './childmonitorheader';
import UniqueChildDetails from './uniqueChildMonitoring/uniquechilddetails';
import UniqueMonitor from './uniqueChildMonitoring/uniquemonitor';
import UpdateMetrics from './uniqueChildMonitoring/updatemetrics';

type RootStackParamList = {
  ChildMonitor: { childId: string; childName: string };
};

type ChildMonitorRouteProp = RouteProp<RootStackParamList, 'ChildMonitor'>;
type ChildMonitorNavigationProp = StackNavigationProp<RootStackParamList, 'ChildMonitor'>;

type Props = {
  route: ChildMonitorRouteProp;
  navigation: ChildMonitorNavigationProp;
};

const ChildMonitor: React.FC<Props> = ({ route }) => {
  const { childId, childName } = route.params;

  // State to store child details
  const [childDetails, setChildDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [selectedTab, setSelectedTab] = useState('Childdetails');

  useEffect(() => {
    const fetchChildDetails = async () => {
      const db = getFirestore();
      const childRef = doc(db, 'Users', '2DaIkDN1VUuNGk199UBJ', 'Childrens', childId); // Use the fixed user ID
      const childSnap = await getDoc(childRef);

      if (childSnap.exists()) {
        setChildDetails(childSnap.data());
      } else {
        console.log('No such document!');
      }
      setLoading(false); // Stop loading
    };

    fetchChildDetails();
  }, [childId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Loading indicator
  }

  return (
    <View className="flex-1">
      {/* Header with tabs */}
      <Childmonitorheader selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      {/* Scrollable content */}
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold mb-4">Monitoring {childName}</Text>

        {/* Conditionally render content based on selected tab */}
        {selectedTab === 'Childdetails' && childDetails && (
          <UniqueChildDetails 
            childId={childId}
            childName={childName}
            birthday={childDetails.birthday}
            gender={childDetails.gender}
            height={childDetails.measurements?.heightHistory[0]?.value} // Ensure you are accessing correctly
            weight={childDetails.measurements?.weightHistory[0]?.value} // Ensure you are accessing correctly
            headCircumference={childDetails.measurements?.headCircumferenceHistory[0]?.value} // Ensure you are accessing correctly
          />
        )}

        {selectedTab === 'Monitor' && (
          <UniqueMonitor childId={childId} childName={childName} />
        )}

        {selectedTab === 'updatemetrics' && (
          <UpdateMetrics childId={childId} childName={childName} />
        )}
      </ScrollView>
    </View>
  );
};

export default ChildMonitor;
