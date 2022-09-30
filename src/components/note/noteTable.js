import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

function NoteTable({item, onLongPress}) {
  return (
    <TouchableOpacity
      className="flex flex-row h-8 justify-between "
      onLongPress={() => onLongPress(item)}
      activeOpacity={1}>
      <Text className="text-white">{item?.amount}</Text>
      <Text className="text-white">{item?.label}</Text>
    </TouchableOpacity>
  );
}

export default NoteTable;
