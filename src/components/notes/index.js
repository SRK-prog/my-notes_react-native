import React, {useEffect, useState} from 'react';
import {ScrollView, Alert} from 'react-native';
import Header from './header';
import NotesCardContainer from './notesCardContainer';
import AddNotes from './addNotes';
import {openDatabase} from 'react-native-sqlite-storage';
import Sqlite from '../../helper/sqliteHelper';

const db = openDatabase({
  name: 'my_notes_db',
});

function Notes({navigation}) {
  const [notes, setNotes] = useState([]);
  const [staredFilter, setStaredFilter] = useState(null);

  useEffect(() => {
    (async () => {
      const response = await new Sqlite().getNotes(db);
      setNotes(response);
    })();
  }, []);

  const addNoteHandler = async request => {
    setNotes([request, ...notes]);
    const {title, isStared, createdAt, updatedAt} = request;
    try {
      await new Sqlite().createTable(db);
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO notes_table (title, isStared, createdAt, updatedAt) VALUES (?,?,?,?)',
          [title, isStared, createdAt, updatedAt],
          (tx, results) => {},
          err => Alert.alert('something went wrong!'),
        );
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deteteNoteAlert = id => {
    const deleteNote = async () => {
      const restNotes = notes.filter(note => note.id != id);
      setNotes(restNotes);
      try {
        const response = await new Sqlite().deleteNote(db, id);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    };
    Alert.alert('Delete Note', 'Are you sure you want to delete this note', [
      {
        text: 'Cancel',
      },
      {text: 'OK', onPress: deleteNote},
    ]);
  };

  const starNote = async (id, star) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === id ? {...note, isStared: !star} : note,
      ),
    );
    try {
      await new Sqlite().updateStar(db, id, !star);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      className="h-full dark:bg-black-20"
      contentInsetAdjustmentBehavior="automatic">
      <Header
        onShowStared={() =>
          setStaredFilter(prev => (prev === null ? false : null))
        }
      />
      <AddNotes addNoteHandler={addNoteHandler} />
      <NotesCardContainer
        notes={notes}
        staredFilter={staredFilter}
        onDelete={deteteNoteAlert}
        onStared={starNote}
        navigation={navigation}
      />
    </ScrollView>
  );
}

export default Notes;
