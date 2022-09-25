import React from 'react';
import {View, Text} from 'react-native';

function NoteTable({item}) {
  return (
    <View className="flex flex-row h-7 justify-between">
      <Text className="dark:text-white">{item?.amount}</Text>
      <Text className="dark:text-white">{item?.label}</Text>
    </View>
  );
}

export default NoteTable;
