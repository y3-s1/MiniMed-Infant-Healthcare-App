import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { UserContext } from '@/contexts/userContext';

type HeightRecord = {
  value: string;
  date: string;
};

const HeightMonitoring: React.FC<{ childId: string }> = ({ childId }) => {
  const [heightRecords, setHeightRecords] = useState<HeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchHeightRecords = async () => {
      if (!user) return;

      const db = getFirestore();
      const childRef = doc(db, 'Users', user.uid, 'Childrens', childId);

      try {
        const childSnap = await getDoc(childRef);
        if (childSnap.exists()) {
          const childData = childSnap.data();
          const heightHistory = childData.measurements?.heightHistory || [];
          setHeightRecords(heightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (error) {
        console.error('Error fetching height records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeightRecords();
  }, [childId, user]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View className="flex-1">
      <Text className="text-xl font-bold mb-4">Height Records</Text>
      {heightRecords.length > 0 ? (
        heightRecords.map((item, index) => (
          <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
            <Text className="text-lg">{item.value} cm</Text>
            <Text className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</Text>
          </View>
        ))
      ) : (
        <Text className="text-center text-gray-500">No height records available.</Text>
      )}
    </View>
  );
};

export default HeightMonitoring;