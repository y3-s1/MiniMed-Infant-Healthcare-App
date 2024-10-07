import { View, Text, TextInput } from 'react-native';
import { useState } from 'react';
import SearchBar from '@/components/appointments/midwives/searchBar';
import MidwivesList from '@/components/appointments/midwives/midwivesList';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <MidwivesList searchQuery={searchQuery} />
    </View>
  );
}

export default Index;
