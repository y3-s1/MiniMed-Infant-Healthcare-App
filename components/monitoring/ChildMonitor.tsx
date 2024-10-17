import React, { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Childmonitorheader from './childmonitorheader';
import UniqueChildDetails from './uniqueChildMonitoring/uniquechilddetails';
import UniqueMonitor from './uniqueChildMonitoring/uniquemonitor';
import UpdateMetrics from './uniqueChildMonitoring/updatemetrics';
import { UserContext } from '@/contexts/userContext';

type RootStackParamList = {
  ChildMonitor: { childId: string; childName: string };
  Home: undefined;
};

type ChildMonitorRouteProp = RouteProp<RootStackParamList, 'ChildMonitor'>;
type ChildMonitorNavigationProp = StackNavigationProp<RootStackParamList, 'ChildMonitor'>;

type Props = {
  route: ChildMonitorRouteProp;
  navigation: ChildMonitorNavigationProp;
};

interface ChildDetails {
  birthday: string;
  gender: string;
  measurements: {
    heightHistory: Array<{ value: string, date: string }>;
    weightHistory: Array<{ value: string, date: string }>;
    headCircumferenceHistory: Array<{ value: string, date: string }>;
  };
}

const ChildMonitor: React.FC<Props> = ({ route, navigation }) => {

  const { user } = useContext(UserContext);
  const { childId, childName } = route.params;

  const [childDetails, setChildDetails] = useState<ChildDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Childdetails');

  useEffect(() => {
    const fetchChildDetails = async () => {
      const db = getFirestore();
      const childRef = doc(db, 'Users', user?.uid, 'Childrens', childId);
      const childSnap = await getDoc(childRef);

      if (childSnap.exists()) {
        setChildDetails(childSnap.data() as ChildDetails);
      } else {
        console.log('No such document!');
      }
      setLoading(false);
    };

    fetchChildDetails();
  }, [childId]);

  const handleUpdateMetrics = async (newMetrics: { 
    height: { value: string, date: string },
    weight: { value: string, date: string },
    headCircumference: { value: string, date: string }
  }) => {
    const db = getFirestore();
    const childRef = doc(db, 'Users', user?.uid, 'Childrens', childId);

    try {
      // Update the metrics in Firestore
      await updateDoc(childRef, {
        'measurements.heightHistory': [...(childDetails?.measurements.heightHistory || []), newMetrics.height],
        'measurements.weightHistory': [...(childDetails?.measurements.weightHistory || []), newMetrics.weight],
        'measurements.headCircumferenceHistory': [...(childDetails?.measurements.headCircumferenceHistory || []), newMetrics.headCircumference],
      });
      Alert.alert('Success', 'Metrics updated successfully!');
      
      // Update local state
      setChildDetails(prevDetails => {
        if (prevDetails) {
          return {
            ...prevDetails,
            measurements: {
              heightHistory: [...prevDetails.measurements.heightHistory, newMetrics.height],
              weightHistory: [...prevDetails.measurements.weightHistory, newMetrics.weight],
              headCircumferenceHistory: [...prevDetails.measurements.headCircumferenceHistory, newMetrics.headCircumference],
            }
          };
        }
        return prevDetails;
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update metrics. Please try again.');
      console.error('Error updating metrics:', error);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    const db = getFirestore();
    const childRef = doc(db, 'Users', user?.uid, 'Childrens', childId);

    try {
      await deleteDoc(childRef);
      Alert.alert('Success', 'Child deleted successfully!');
      navigation.goBack(); // Navigate back to the previous screen
    } catch (error) {
      Alert.alert('Error', 'Failed to delete child. Please try again.');
      console.error('Error deleting child:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  const getLatestMetric = (history: Array<{ value: string, date: string }> | undefined) => {
    if (!history || history.length === 0) return 0; // Return 0 instead of 'N/A'
    return parseFloat(history[history.length - 1].value) || 0; // Parse to number, default to 0 if parsing fails
  };

  const latestHeight = getLatestMetric(childDetails?.measurements.heightHistory);
  const latestWeight = getLatestMetric(childDetails?.measurements.weightHistory);
  const latestHeadCircumference = getLatestMetric(childDetails?.measurements.headCircumferenceHistory);

  return (
    <View className="flex-1">
      <Childmonitorheader selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

      <ScrollView className="flex-1 px-4 pt-4">
        {selectedTab === 'Childdetails' && childDetails && (
          <UniqueChildDetails 
            childId={childId}
            childName={childName}
            birthday={childDetails.birthday}
            gender={childDetails.gender}
            height={latestHeight}
            weight={latestWeight}
            headCircumference={latestHeadCircumference}
            onDeleteChild={handleDeleteChild}
          />
        )}

        {selectedTab === 'Monitor' && (
          <UniqueMonitor childId={childId} childName={childName} />
        )}

        {selectedTab === 'updatemetrics' && (
          <UpdateMetrics 
            childId={childId} 
            childName={childName} 
            onUpdateMetrics={handleUpdateMetrics}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ChildMonitor;