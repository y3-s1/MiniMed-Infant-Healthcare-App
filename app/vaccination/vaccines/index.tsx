import { View, Text } from 'react-native'
import React from 'react'
import VaccinationTab from '@/components/vaccination/vaccine/VaccinationItem'

const Vaccines = () => {
  return (
    <View className='flex-1'>
      <VaccinationTab/>
    </View>
  )
}

export default Vaccines