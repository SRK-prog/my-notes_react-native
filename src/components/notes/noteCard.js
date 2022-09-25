import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  TouchableHighlight,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import {useState} from 'react';
import moment from 'moment';

function NotesCard({note, onDelete, navigation, onStared}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [showDelete, setShowDelete] = useState(false);

  return (
    <TouchableOpacity
      className="bg-black-30 mt-2.5 px-3 mx-5 py-2.5 rounded-sm"
      onPress={() => navigation.navigate('note', {...note})}
      onLongPress={() => setShowDelete(true)}
      activeOpacity={0.4}>
      <View className="flex justify-between flex-row h-7 mb-4">
        <Text className="text-grey-10 text-lg font-semibold">
          {note?.title}
        </Text>
        <TouchableHighlight
          onPress={() => onStared(note?.id, note?.isStared)}
          activeOpacity={1}
          underlayColor="#3d3d3d"
          className="pl-5">
          <Icon
            name={note?.isStared ? 'star' : 'star-o'}
            size={20}
            color={isDarkMode ? '#b0b0b0' : '#b0b0b0'}
          />
        </TouchableHighlight>
      </View>
      <View className="flex flex-row justify-between">
        <Text className="text-grey-10">
          {moment(note?.createdAt).format('DD/MM/YYYY')}
        </Text>
        <Text className="text-grey-10">
          {moment(note?.updatedAt).fromNow()}
        </Text>
      </View>
      {showDelete && (
        <View className="pt-3 flex flex-row justify-end gap-3">
          <TouchableOpacity
            className="w-14 flex justify-center items-center bg-red-600 rounded-sm h-8"
            onPress={() => {
              onDelete(note?.id);
              setShowDelete(false);
            }}>
            <Text className="text-white font-bold">Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-14 flex justify-center items-center bg-grey-20 rounded-sm h-8"
            onPress={() => setShowDelete(false)}>
            <Text className="text-white font-bold">Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default NotesCard;
