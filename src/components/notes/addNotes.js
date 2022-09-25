import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';

function AddNotes({addNoteHandler}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [showInputField, setShowInputField] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');

  const addNote = () => {
    if (!noteTitle.trim()) return;
    addNoteHandler({
      title: noteTitle,
      isStared: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
        <View className="dark:bg-black-10 h-11 flex flex-row items-center mx-3.5 mt-2.5">
          <TouchableOpacity
            className="px-4 h-full flex justify-center items-center"
            onPress={() => setShowInputField(false)}>
            <Icon
              name="remove"
              size={15}
              color={isDarkMode ? '#bfbbbb' : 'black'}
            />
          </TouchableOpacity>
          <TextInput
            className="flex-grow dark:bg-slate-200 py-1 rounded dark:text-black-0"
            value={noteTitle}
            onChangeText={setNoteTitle}
            autoFocus
            placeholder="Add New..."
            onSubmitEditing={addNote}
            placeholderTextColor={isDarkMode ? "#828282" : 'black'}
          />
          <TouchableOpacity className="dark:text-white px-4" onPress={addNote}>
            <Text>Create</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          className="dark:bg-black-10 h-11 flex flex-row items-center mx-3.5 mt-2.5 px-4"
          onPress={closeInput}
          activeOpacity={0.4}>
          <Icon
            name="plus"
            size={15}
            color={isDarkMode ? '#bfbbbb' : 'black'}
          />
          <Text className="ml-2.5">Add New</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default AddNotes;
