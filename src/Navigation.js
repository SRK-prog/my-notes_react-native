import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Notes from './components/notes';
import Note from './components/note';

const NavStack = createStackNavigator();

const Navigation = () => {
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
            headerStyle: {backgroundColor: '#7a7a7a', borderColor: 'white'},
            headerTitleStyle: {color: 'white'},
            headerTintColor: 'white',
          }}
        />
      </NavStack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
