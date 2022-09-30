import React, {useEffect, useState} from 'react';
import {ScrollView, Alert} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import Header from './header';
import NotesCardContainer from './notesCardContainer';
import AddNotes from './addNotes';
import {openDatabase} from 'react-native-sqlite-storage';
import Sqlite from '../../helper/sqliteHelper';
import {parseResult} from '../../utility';

const db = openDatabase({name: 'my_notes_db'});

function Notes({navigation}) {
  const [notes, setNotes] = useState([]);
  const [staredFilter, setStaredFilter] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      try {
        const {results} = await new Sqlite().executeSQL(
          db,
          'SELECT * FROM notes_table',
        );
        const data = parseResult(results);
        const sorted = data.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
        );
        setNotes(sorted);
      } catch (error) {}
    })();
  }, [isFocused]);

  const addNoteHandler = async request => {
    setNotes([request, ...notes]);
    const {id, title, isStared, createdAt, updatedAt} = request;
    try {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO notes_table (id, title, isStared, createdAt, updatedAt) VALUES (?,?,?,?,?)',
          [id, title, isStared, createdAt, updatedAt],
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
        const {deleteNote, deleteNoteItems} = new Sqlite();
        await Promise.all([deleteNote(db, id), deleteNoteItems(db, id)]);
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
        note.id === id ? {...note, isStared: star === 0 ? 1 : 0} : note,
      ),
    );
    try {
      await new Sqlite().executeSQL(
        db,
        `UPDATE notes_table SET isStared=${!star} WHERE id=${id}`,
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView
      className="h-full bg-black-20"
      contentInsetAdjustmentBehavior="automatic">
      <Header
        onShowStared={() => setStaredFilter(prev => (prev === null ? 0 : null))}
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
