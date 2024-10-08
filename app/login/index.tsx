import { View, Text, Image, Pressable } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const index = () => {
  return (
    <View>
      <Image className='w-full h-96' source={require('./../../assets/images/logo.jpg')}/>
      <Pressable 
      onPress={() => {router.push('./sign-up')}}
      className='w-3/5 p-4 m-auto mt-10 rounded-lg bg-sky-700'>
        <Text className=' text-white text-lg m-auto'>Get Start</Text>
      </Pressable>
    </View>
  )
}

export default index