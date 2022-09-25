import React, {useState} from 'react';
import {Text, View, TouchableOpacity, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Ionicons';

function Header({onShowStared}) {
  const [showMenu, setShowMenu] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View className="dark:bg-black-10">
      <View className="flex flex-row h-16 items-center justify-between px-4">
        <Text className="text-xl font-bold dark:text-white">Book</Text>
        <View className="h-full flex items-center justify-center">
          <Icon
            onPress={() => setShowMenu(prev => !prev)}
            name="menu"
            size={30}
            color={isDarkMode ? 'white' : 'black'}
          />
        </View>
      </View>
      {showMenu && <Menubar onShowStared={onShowStared} />}
    </View>
  );
}

export default Header;

function Menubar({onShowStared}) {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View>
      <TouchableOpacity
        onPress={onShowStared}
        className="flex flex-row gap-2 ml-auto px-4 py-3"
        activeOpacity={0.5}>
        <Icon name="star" size={16} color={isDarkMode ? 'white' : 'black'} />
        <Text>Stared</Text>
      </TouchableOpacity>
    </View>
  );
}
