import React, {useState} from 'react';
import {Text, View, TouchableOpacity, useColorScheme} from 'react-native';
import Icon from 'react-native-vector-icons/dist/Ionicons';
import MetIcon from 'react-native-vector-icons/dist/MaterialCommunityIcons';

function Header({onShowStared, onSelectFile}) {
  const [showMenu, setShowMenu] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View className="bg-black-10">
      <View className="flex flex-row h-16 items-center justify-between px-4">
        <Text className="text-xl font-bold text-white">My Notes</Text>
        <View className="h-full flex items-center justify-center">
          <Icon
            onPress={() => setShowMenu(prev => !prev)}
            name="menu"
            size={30}
            color={isDarkMode ? 'white' : 'white'}
          />
        </View>
      </View>
      {showMenu && (
        <Menubar
          onShowStared={onShowStared}
          onSelectFile={onSelectFile}
          onClose={() => setShowMenu(false)}
        />
      )}
    </View>
  );
}

export default Header;

function Menubar({onShowStared, onSelectFile, onClose}) {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          onClose();
          onShowStared();
        }}
        className="flex flex-row gap-2 ml-auto px-4 py-2"
        activeOpacity={0.5}>
        <Icon name="star" size={16} color={isDarkMode ? 'white' : 'white'} />
        <Text>Stared</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          onSelectFile();
          onClose();
        }}
        className="flex flex-row gap-2 ml-auto px-4 py-2"
        activeOpacity={0.5}>
        <MetIcon
          name="file-import-outline"
          size={16}
          color={isDarkMode ? 'white' : 'white'}
        />
        <Text>Import</Text>
      </TouchableOpacity>
    </View>
  );
}
