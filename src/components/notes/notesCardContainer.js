import React from 'react';
import {View} from 'react-native';
import NotesCard from './noteCard';

function NotesCardContainer({
  notes,
  staredFilter,
  onDelete,
  onStared,
  navigation,
  onDownload,
}) {
  return (
    <View className="mt-2.5">
      {notes
        .filter(item => item?.isStared !== staredFilter)
        .map((note, index) => (
          <NotesCard
            note={note}
            key={index}
            onDelete={onDelete}
            onStared={onStared}
            navigation={navigation}
            onDownload={onDownload}
          />
        ))}
    </View>
  );
}

export default NotesCardContainer;
