import { View, Text } from 'react-native'
import React from 'react'
import Notification from '@/components/vaccination/common/Notification'

const NotificationPage = () => {
  return (
    <View className='flex-1'>
        {/* notifications */}
        <Notification/>
    </View>
  )
}

export default NotificationPage