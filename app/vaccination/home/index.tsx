import { View, Text } from 'react-native'
import React from 'react'
import Childs from '@/components/vaccination/home/Childs'
import Reminders from '@/components/vaccination/home/Reminders'

const VaccineHome = () => {
  return (
    <View className='flex-1'>
      {/* childs */}
      <Childs/>

      {/* reminders */}
      <Reminders/>
    </View>
  )
}

export default VaccineHome