import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import {uiid} from '../../utility';

function AddNotes({addNoteHandler}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [showInputField, setShowInputField] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');

  const addNote = () => {
    if (!noteTitle.trim()) return;
    addNoteHandler({
      id: uiid(),
      title: noteTitle,
      isStared: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      showTotal: 0,
    });
    setNoteTitle('');
    setShowInputField(false);
  };

  const closeInput = () => {
    setShowInputField(true);
    setNoteTitle('');
  };

  return (
    <View>
      {showInputField ? (
        <View className="bg-black-10 h-11 flex flex-row items-center mx-3.5 mt-2.5">
          <TouchableOpacity
            className="px-4 h-full flex justify-center items-center"
            onPress={() => setShowInputField(false)}>
            <Icon
              name="remove"
              size={15}
              color={isDarkMode ? '#bfbbbb' : '#bfbbbb'}
            />
          </TouchableOpacity>
          <TextInput
            className="flex-grow bg-white py-1 rounded text-black-0"
            value={noteTitle}
            onChangeText={setNoteTitle}
            autoFocus
            placeholder="Add New..."
            onSubmitEditing={addNote}
            placeholderTextColor={isDarkMode ? '#828282' : '#828282'}
          />
          <TouchableOpacity className="text-white px-4" onPress={addNote}>
            <Text>Create</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className="bg-black-10 h-11 flex flex-row items-center mx-3.5 mt-2.5 px-4"
          onPress={closeInput}
          activeOpacity={0.4}>
          <Icon
            name="plus"
            size={15}
            color={isDarkMode ? '#bfbbbb' : '#bfbbbb'}
          />
          <Text className="ml-2.5">Add New</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default AddNotes;
