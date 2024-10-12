import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { UserContext } from '@/contexts/userContext';
import { LineChart } from 'react-native-chart-kit';

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
          setWeightRecords(weightHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
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

  // Function to format dates and reduce the number of labels
  const formatChartData = (records: WeightRecord[]) => {
    const step = Math.max(1, Math.floor(records.length / 5)); // Show max 5 labels
    return {
      labels: records.map((record, index) => 
        index % step === 0 ? new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
      ),
      datasets: [{
        data: records.map(record => parseFloat(record.value))
      }]
    };
  };

  const chartData = formatChartData(weightRecords);

  return (
    <View className="flex-1">
      <Text className="text-xl font-bold mb-4">Weight Records</Text>
      
      {weightRecords.length > 0 ? (
        <>
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 16}
            height={220}
            yAxisSuffix=" kg"
            chartConfig={{
              backgroundColor: '#3498db',
              backgroundGradientFrom: '#3498db',
              backgroundGradientTo: '#2980b9',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#ffa726'
              }
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16
            }}
          />
          
          {weightRecords.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200">
              <Text className="text-lg">{item.value} kg</Text>
              <Text className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</Text>
            </View>
          ))}
        </>
      ) : (
        <Text className="text-center text-gray-500">No weight records available.</Text>
      )}
    </View>
  );
};

export default WeightMonitoring;