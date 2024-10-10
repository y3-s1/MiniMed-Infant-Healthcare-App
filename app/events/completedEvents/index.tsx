import { View, Text } from 'react-native'
import CompletedEventsList from '@/components/events/completedEvents/completedEvents'


const CompletedEvents = () => {
  return (
    <View style={{ flex: 1 }}>
      <CompletedEventsList />
    </View>
  );
};

export default CompletedEvents;
