import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {openDatabase} from 'react-native-sqlite-storage';
import Notes from './components/notes';
import Note from './components/note';
import Sqlite from './helper/sqliteHelper';

const db = openDatabase({name: 'my_notes_db'});

const NavStack = createStackNavigator();

const Navigation = () => {
  useEffect(() => {
    (async () => {
      try {
        const firstTime = await AsyncStorage.getItem('alreadyLaunched');
        if (firstTime != null) return;
        await new Sqlite(db).createTables();
        await AsyncStorage.setItem('alreadyLaunched', 'true');
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <NavStack.Navigator>
        <NavStack.Screen
          name="notes"
          component={Notes}
          options={{headerShown: false}}
        />
        <NavStack.Screen
          name="note"
          component={Note}
          options={{
            title: '',
            headerStyle: {backgroundColor: '#262626'},
            headerTitleStyle: {color: 'white'},
            headerTintColor: 'white',
          }}
        />
      </NavStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
