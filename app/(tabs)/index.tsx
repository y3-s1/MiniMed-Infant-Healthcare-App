import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Header from '@/components/monitoring/header';
import ChildList from '@/components/monitoring/childlist';
import AddChild from '@/components/monitoring/addchild';
import ChildMonitor from '@/components/monitoring/ChildMonitor';

type RootStackParamList = {
  Main: undefined;
  ChildMonitor: { childId: string; childName: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const MainScreen = () => {
  const [selectedTab, setSelectedTab] = useState('ChildList');

  return (
    <View style={styles.container}>
      <Header selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <View style={styles.content}>
        {selectedTab === 'ChildList' ? <ChildList /> : <AddChild />}
      </View>
    </View>
  );
};

export default function Tab() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChildMonitor"
        component={ChildMonitor}
        options={({ route }) => ({ 
          title: `Monitor: ${route.params.childName}` 
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});