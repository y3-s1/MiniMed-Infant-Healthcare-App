import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { TailwindProvider } from 'tailwindcss-react-native';

interface VaccinationItem {
  id: string;
  name: string;
  date: string;
  status: 'Completed' | 'Rescheduled' | 'Allege';
}

const vaccinations: VaccinationItem[] = [
  { id: '1', name: 'B.C.G', date: '13-02-2024', status: 'Completed' },
  { id: '2', name: 'Pentavalent 1', date: '15-04-2024', status: 'Completed' },
  { id: '3', name: 'OPV 1', date: '22-04-2024', status: 'Rescheduled' },
  { id: '4', name: 'Pentavalent 2', date: '18-06-2024', status: 'Completed' },
];

const calculateCounts = () => {
  const completed = vaccinations.filter(vaccine => vaccine.status === 'Completed').length;
  const rescheduled = vaccinations.filter(vaccine => vaccine.status === 'Rescheduled').length;
  const allege = vaccinations.filter(vaccine => vaccine.status === 'Allege').length;

  return { completed, rescheduled, allege };
};

const AnalysisTab = () => {
  const { completed, rescheduled, allege } = calculateCounts();

  return (
    <TailwindProvider>
      <ScrollView className="flex-1 p-4 bg-gray-100" showsVerticalScrollIndicator={false}>
        {/* Counts Section */}
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <Text className="text-4xl font-bold">{completed}</Text>
            <Text className="text-gray-500">Completed</Text>
          </View>
          <View className="items-center">
            <Text className="text-4xl font-bold">{rescheduled}</Text>
            <Text className="text-gray-500">Rescheduled</Text>
          </View>
          <View className="items-center">
            <Text className="text-4xl font-bold">{allege}</Text>
            <Text className="text-gray-500">Allege</Text>
          </View>
        </View>

        {/* Table Header */}
        <View className="flex-row justify-between bg-gray-200 px-4 py-2 rounded-t-lg">
          <Text className="text-base font-bold w-1/3">Vaccination</Text>
          <Text className="text-base font-bold w-1/4">Date</Text>
          <Text className="text-base font-bold w-1/6 text-center">Status</Text>
        </View>

        {/* Vaccination List */}
        {vaccinations.map(item => (
          <View key={item.id} className="flex-row justify-between py-3 px-4 border-b border-gray-300">
            <Text className="text-base w-1/3">{item.name}</Text>
            <Text className="text-base w-1/4">{item.date}</Text>
            <View className="w-1/6 flex items-center">
              {item.status === 'Completed' && <Text className="text-green-500">✔️</Text>}
              {item.status === 'Rescheduled' && <Text className="text-yellow-500">📅</Text>}
              {item.status === 'Allege' && <Text className="text-red-500">❗</Text>}
            </View>
          </View>
        ))}

        {/* Indicator Menu */}
        <View className="mt-6 p-4 bg-white rounded-lg shadow">
          <Text className="text-lg font-bold mb-4">Status Indicators</Text>
          <View className="flex-row justify-around">
            <View className="flex items-center">
              <Text className="text-green-500 text-2xl">✔️</Text>
              <Text className="text-base text-gray-500">Completed</Text>
            </View>
            <View className="flex items-center">
              <Text className="text-yellow-500 text-2xl">📅</Text>
              <Text className="text-base text-gray-500">Rescheduled</Text>
            </View>
            <View className="flex items-center">
              <Text className="text-red-500 text-2xl">❗</Text>
              <Text className="text-base text-gray-500">Allege</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </TailwindProvider>
  );
};

export default AnalysisTab;
