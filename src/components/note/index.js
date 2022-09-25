import {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableHighlight,
  useColorScheme,
  Alert,
  Keyboard,
} from 'react-native';
import Sqlite from '../../helper/sqliteHelper';
import NoteTable from './noteTable';
import {openDatabase} from 'react-native-sqlite-storage';

const db = openDatabase({
  name: 'my_notes_db',
});

function Note({route}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [noteItems, setNoteItems] = useState([]);
  const initialValue = {amount: '', label: ''};
  const [fieldValues, setFieldValues] = useState(initialValue);
  const [selectedField, setSelectedField] = useState('amount');

  useEffect(() => {
    (async () => {
      try {
        await new Sqlite().createNoteItemTable(db);
        const response = await new Sqlite().getNoteItems(db, route?.params?.id);
        setNoteItems(response);
      } catch (error) {
        console.log(error, 'error');
      }
    })();
  }, []);

  const addHandler = async () => {
    if (!fieldValues.amount) {
      setSelectedField('amount');
      return;
    }
    if (!fieldValues.label) {
      setSelectedField('label');
      return;
    }
    Keyboard.dismiss();

    try {
      const calculatedAmount = eval(fieldValues?.amount);
      const newItem = {
        amount: calculatedAmount,
        label: fieldValues?.label,
        note_id: route?.params?.id,
      };
      setFieldValues(initialValue);
      console.log(newItem, 'newItem');
      setSelectedField('amount');
      setNoteItems(prev => [...prev, newItem]);
      const res = await new Sqlite().createNoteItem(db, newItem);
      console.log(res);
    } catch (error) {
      console.log(error);
      Alert.alert('Invalid amount', 'Please enter a valid amount', [
        {text: 'OK'},
      ]);
    }
  };

  const onChange = value => {
    setFieldValues(prev => ({...prev, [selectedField]: value}));
  };

  return (
    <View className="h-full dark:bg-black-20">
      <Text className="m-4 text-lg dark:text-white font-semibold">
        {route?.params?.title}
      </Text>
      <View className="dark:bg-grey-30 h-80 mx-5 p-4 rounded">
        <ScrollView>
          {noteItems?.map((item, index) => (
            <NoteTable item={item} key={index} />
          ))}
        </ScrollView>
      </View>
      <View className="w-full absolute bottom-5 px-5 gap-3">
        <View className="flex flex-row justify-between px-3">
          <TouchableHighlight
            activeOpacity={1}
            onPress={() => setSelectedField('amount')}>
            <>
              <Text className="dark:text-white font-semibold text-base">
                Amount
              </Text>
              {!!fieldValues?.amount && (
                <Text className="dark:text-white text-base">
                  {fieldValues?.amount}
                </Text>
              )}
            </>
          </TouchableHighlight>
          <TouchableHighlight
            activeOpacity={1}
            onPress={() => setSelectedField('label')}>
            <>
              <Text className="dark:text-white font-semibold text-base">
                Label
              </Text>
              {!!fieldValues?.label && (
                <Text className="dark:text-white text-base">
                  {fieldValues?.label}
                </Text>
              )}
            </>
          </TouchableHighlight>
        </View>
        <TextInput
          className="w-full dark:bg-white py-1.5 dark:text-black-0 px-2 rounded"
          placeholder={`Enter ${selectedField}`}
          placeholderTextColor={isDarkMode ? '#828282' : 'black'}
          onChangeText={onChange}
          value={fieldValues[selectedField]}
          onSubmitEditing={addHandler}
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

export default Note;
