import {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Keyboard,
} from 'react-native';
import Sqlite from '../../helper/sqliteHelper';
import NoteTable from './noteTable';
import {openDatabase} from 'react-native-sqlite-storage';
import {parseResult} from '../../utility';

const db = openDatabase({name: 'my_notes_db'});

function Note({route}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [noteItems, setNoteItems] = useState([]);
  const initialValue = {amount: '', label: ''};
  const [fieldValues, setFieldValues] = useState(initialValue);
  const [selectedField, setSelectedField] = useState('amount');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [editMode, setEditMode] = useState({
    status: false,
    noteItem: {},
  });
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const scrollRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    (async () => {
      try {
        const {results} = await new Sqlite().executeSQL(
          db,
          `SELECT * FROM note_items_table WHERE note_id=${route?.params?.id}`,
        );
        const data = parseResult(results);
        setNoteItems(data);
        const lastItem = data?.[data.length - 1];
        if (lastItem) {
          setFieldValues(prev => ({
            ...prev,
            amount: `${lastItem?.amount}`,
          }));
          setCalculatedAmount(`${lastItem?.amount}`);
        }
      } catch (error) {
        console.log(error, 'error');
      }
    })();
  }, []);

  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHide.remove();
      keyboardDidShow.remove();
    };
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
    if (calculatedAmount === 'Invalid') {
      Alert.alert('Invalid amount', 'Please enter a valid amount', [
        {text: 'OK'},
      ]);
      return;
    }
    try {
      if (editMode.status) {
        const {noteItem} = editMode;
        const calAmount = calculatedAmount;
        const label = fieldValues?.label;
        setNoteItems(prevItem =>
          prevItem?.map(item =>
            item?.id == noteItem?.id
              ? {...noteItem, amount: calAmount, label}
              : item,
          ),
        );
        setEditMode({status: false, noteItem: {}});
        setFieldValues(initialValue);
        setCalculatedAmount(0);
        setSelectedField('amount');
        const {executeSQL} = new Sqlite();
        await Promise.all([
          executeSQL(
            db,
            `UPDATE note_items_table SET amount=${calAmount}, label="${label}" WHERE id=${noteItem?.id}`,
          ),
          executeSQL(
            db,
            `UPDATE notes_table SET updatedAt=${Date.now()} WHERE id=${
              route?.params?.id
            }`,
          ),
        ]);
      } else {
        const newItem = {
          amount: calculatedAmount,
          label: fieldValues?.label,
          note_id: route?.params?.id,
        };
        setFieldValues(initialValue);
        setCalculatedAmount(0);
        setSelectedField('amount');
        setNoteItems(prev => [...prev, newItem]);
        const {createNoteItem, executeSQL} = new Sqlite();

        await Promise.all([
          createNoteItem(db, newItem),
          executeSQL(
            db,
            `UPDATE notes_table SET updatedAt=${Date.now()} WHERE id=${
              route?.params?.id
            }`,
          ),
        ]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Something Went Wrong!');
    }
  };

  const onChange = value => {
    setFieldValues(prev => ({...prev, [selectedField]: value}));
    if (selectedField === 'amount') {
      try {
        setCalculatedAmount(eval(value));
      } catch (error) {
        setCalculatedAmount('Invalid');
      }
    }
  };

  const deteteNoteItem = id => {
    const deleteItem = async () => {
      setNoteItems(prevItem => prevItem?.filter(item => item.id != id));
      try {
        await new Sqlite().executeSQL(
          db,
          `DELETE FROM note_items_table WHERE id=${id}`,
        );
      } catch (error) {
        console.log(error);
      }
    };
    Alert.alert('Delete', 'Are you sure you want to delete', [
      {
        text: 'Cancel',
      },
      {text: 'Delete', onPress: deleteItem},
    ]);
  };

  const openAlert = value => {
    const {amount, label, id} = value;
    Alert.alert('Select Option', `Amount: ${amount}  Label: ${label}`, [
      {text: 'Cancel'},
      {text: 'Delete', onPress: () => deteteNoteItem(id)},
      {
        text: 'Edit',
        onPress: () => {
          setEditMode({status: true, noteItem: value});
          setFieldValues({amount: `${amount}`, label});
          setCalculatedAmount(`${amount}`);
          inputRef?.current?.focus();
        },
      },
    ]);
  };

  return (
    <View className="h-full bg-black-20">
      <Text className="m-4 text-lg text-white font-semibold">
        {route?.params?.title}
      </Text>
      <View className={`bg-grey-30 mx-5 p-4 rounded h-80`}>
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={(width, height) =>
            scrollRef?.current?.scrollTo({y: height})
          }
          onLayout={({nativeEvent: {layout}}) =>
            scrollRef?.current?.scrollTo({y: layout?.height})
          }>
          {noteItems?.map((item, idx) => (
            <NoteTable item={item} key={idx} onLongPress={openAlert} />
          ))}
        </ScrollView>
      </View>
      <View className="w-full absolute bottom-5 px-5 gap-3 left-0">
        <View
          className={`flex flex-row justify-between px-2 w-full py-1 ${
            isKeyboardVisible && 'bg-black-30'
          }`}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedField('amount')}>
            <>
              <Text className="text-white font-semibold text-base">Amount</Text>
              {!!fieldValues?.amount && (
                <Text className="text-white text-base">
                  {fieldValues?.amount}
                </Text>
              )}
            </>
          </TouchableOpacity>
          <View>
            <Text className="text-white font-semibold text-base">Total</Text>
            {!!calculatedAmount && (
              <Text className="text-white text-base">{calculatedAmount}</Text>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSelectedField('label')}>
            <>
              <Text className="text-white font-semibold text-base">Label</Text>
              {!!fieldValues?.label && (
                <Text className="text-white text-base">
                  {fieldValues?.label}
                </Text>
              )}
            </>
          </TouchableOpacity>
        </View>
        <TextInput
          ref={inputRef}
          className="w-full bg-white py-1.5 text-black-0 px-2 rounded"
          placeholder={`Enter ${selectedField}`}
          placeholderTextColor={isDarkMode ? '#828282' : '#828282'}
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
