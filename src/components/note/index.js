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
import {parseResult, uiid, dateToDMY, fromNow} from '../../utility';

const db = openDatabase({name: 'my_notes_db'});

function Note({route}) {
  const isDarkMode = useColorScheme() === 'dark';
  const [noteItems, setNoteItems] = useState([]);
  const initialValue = {amount: '', label: ''};
  const [fieldValues, setFieldValues] = useState(initialValue);
  const [selectedField, setSelectedField] = useState('amount');
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [showTotal, setShowTotal] = useState({
    status: route?.params?.showTotal || 0,
    total: 0,
  });
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
        const {results} = await new Sqlite(db).executeSQL(
          `SELECT * FROM note_items_table WHERE note_id=${route?.params?.id} ORDER BY createdAt ASC`,
        );
        const data = parseResult(results);
        setNoteItems(data);
        if (showTotal.status) {
          setShowTotal(prev => ({
            ...prev,
            total: data.reduce((n, {amount}) => n + amount, 0),
          }));
        }
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
  }, [showTotal.status]);

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
    const id = uiid();
    const amount = calculatedAmount;
    const label = fieldValues?.label;
    const note_id = route?.params?.id;
    const createdAt = Date.now();
    const updatedAt = Date.now();
    const {executeSQL} = new Sqlite(db);
    if (fieldValues.amount === 'total') {
      const status = showTotal.status == 0 ? 1 : 0;
      executeSQL(
        `UPDATE notes_table SET showTotal=${status} WHERE id=${note_id}`,
      ).catch(() => {});
      setShowTotal(prev => ({...prev, status}));
      return;
    }
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

    setFieldValues(initialValue);
    setCalculatedAmount(0);
    setSelectedField('amount');

    try {
      if (editMode.status) {
        const {noteItem} = editMode;
        setNoteItems(prevItem =>
          prevItem?.map(item =>
            item?.id == noteItem?.id ? {...noteItem, amount, label} : item,
          ),
        );
        setEditMode({status: false, noteItem: {}});
        await Promise.all([
          executeSQL(
            `UPDATE note_items_table SET amount=${amount}, label="${label}", updatedAt=${updatedAt} WHERE id=${noteItem?.id}`,
          ),
          executeSQL(
            `UPDATE notes_table SET updatedAt=${updatedAt} WHERE id=${note_id}`,
          ),
        ]);
      } else {
        setNoteItems(prev => [
          ...prev,
          {id, amount, label, note_id, createdAt, updatedAt},
        ]);
        const {executeSQL} = new Sqlite(db);
        await Promise.all([
          executeSQL(
            'INSERT INTO note_items_table (id, amount, label, note_id, createdAt, updatedAt) VALUES (?,?,?,?,?,?)',
            [id, amount, label, note_id, createdAt, updatedAt],
          ),
          executeSQL(
            `UPDATE notes_table SET updatedAt=${updatedAt} WHERE id=${note_id}`,
          ),
        ]);
      }
    } catch (error) {
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
        await new Sqlite(db).executeSQL(
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
    const {amount, label, id, createdAt, updatedAt} = value;
    Alert.alert(
      'Select Option',
      `Amount: ${amount}  Label: ${label} \n\nDate: ${dateToDMY(
        createdAt,
      )}  LastEdit: ${fromNow(updatedAt)}`,
      [
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
      ],
    );
  };

  const selectItem = ({amount}) => {
    setFieldValues({amount: `${amount}`});
    setCalculatedAmount(`${amount}`);
  };

  return (
    <View className="h-full bg-black-20">
      <Text className="m-4 text-lg text-white font-semibold">
        {route?.params?.title}
      </Text>
      <View className={`bg-grey-30 mx-5 rounded h-80 py-3`}>
        <ScrollView
          className="px-4"
          ref={scrollRef}
          onContentSizeChange={(width, height) =>
            scrollRef?.current?.scrollTo({y: height})
          }
          onLayout={({nativeEvent: {layout}}) =>
            scrollRef?.current?.scrollTo({y: layout?.height})
          }>
          {noteItems?.map((item, idx) => (
            <NoteTable
              item={item}
              key={idx}
              onLongPress={openAlert}
              onPress={selectItem}
            />
          ))}
          {!!showTotal.status && (
            <NoteTable
              item={{amount: showTotal.total, label: 'Total'}}
              onLongPress={() => {}}
              onPress={() => {}}
            />
          )}
        </ScrollView>
      </View>
      <View className="w-full absolute bottom-5 px-5 gap-3 left-0">
        <View
          className={`flex flex-row justify-between px-2 w-full py-1 rounded-sm ${
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
