import { View, Text } from 'react-native'
import React from 'react'
import Reminders from '@/components/vaccination/home/Reminders'

const ReminderPage = () => {
  return (
    <View className='flex-1'>
      <Reminders/>
    </View>
  )
}

export default ReminderPage