import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
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
      const childRef = doc(db, 'Users', '2DaIkDN1VUuNGk199UBJ', 'Childrens', childId);
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

  // Function to handle metrics update
  const handleUpdateMetrics = async (newMetrics: { height: string; weight: string; headCircumference: string }) => {
    const db = getFirestore();
    const childRef = doc(db, 'Users', '2DaIkDN1VUuNGk199UBJ', 'Childrens', childId);

    try {
      // Update the metrics in Firestore
      await updateDoc(childRef, {
        'measurements.heightHistory': [...(childDetails.measurements?.heightHistory || []), { value: newMetrics.height }],
        'measurements.weightHistory': [...(childDetails.measurements?.weightHistory || []), { value: newMetrics.weight }],
        'measurements.headCircumferenceHistory': [...(childDetails.measurements?.headCircumferenceHistory || []), { value: newMetrics.headCircumference }],
      });
      Alert.alert('Success', 'Metrics updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update metrics. Please try again.');
      console.error('Error updating metrics:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />; // Loading indicator
  }

  // Get the latest metrics
  const latestHeight = childDetails?.measurements?.heightHistory?.slice(-1)[0]?.value || 'N/A';
  const latestWeight = childDetails?.measurements?.weightHistory?.slice(-1)[0]?.value || 'N/A';
  const latestHeadCircumference = childDetails?.measurements?.headCircumferenceHistory?.slice(-1)[0]?.value || 'N/A';

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
            height={latestHeight} // Use the latest height
            weight={latestWeight} // Use the latest weight
            headCircumference={latestHeadCircumference} // Use the latest head circumference
          />
        )}

        {selectedTab === 'Monitor' && (
          <UniqueMonitor childId={childId} childName={childName} />
        )}

        {selectedTab === 'updatemetrics' && (
          <UpdateMetrics 
            childId={childId} 
            childName={childName} 
            onUpdateMetrics={handleUpdateMetrics} // Pass the update function
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ChildMonitor;
