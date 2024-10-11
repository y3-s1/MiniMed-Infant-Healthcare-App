import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { UserContext } from '@/contexts/userContext';

type WeightRecord = {
  value: string;
  date: string;
};

const WeightMonitoring: React.FC<{ childId: string }> = ({ childId }) => {
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchWeightRecords = async () => {
      if (!user) return;

      const db = getFirestore();
      const childRef = doc(db, 'Users', user.uid, 'Childrens', childId);

      try {
        const childSnap = await getDoc(childRef);
        if (childSnap.exists()) {
          const childData = childSnap.data();
          const weightHistory = childData.measurements?.weightHistory || [];
          setWeightRecords(weightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (error) {
        console.error('Error fetching weight records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeightRecords();
  }, [childId, user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="flex-1">
      <Text className="text-xl font-bold mb-4">Weight Records</Text>
      {weightRecords.length > 0 ? (
        weightRecords.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
            <Text className="text-lg">{item.value} kg</Text>
            <Text className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        ))
      ) : (
        <Text className="text-center text-gray-500">No weight records available.</Text>
      )}
    </View>
  );
};

export default WeightMonitoring;