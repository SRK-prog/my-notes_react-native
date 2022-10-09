import React, {useEffect, useState} from 'react';
import {ScrollView, Alert} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {openDatabase} from 'react-native-sqlite-storage';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import Header from './header';
import NotesCardContainer from './notesCardContainer';
import AddNotes from './addNotes';
import Sqlite from '../../helper/sqliteHelper';
import {parseResult, dateToDMY, createQueryFromArray} from '../../utility';

const db = openDatabase({name: 'my_notes_db'});

function Notes({navigation}) {
  const [notes, setNotes] = useState([]);
  const [staredFilter, setStaredFilter] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      try {
        const {results} = await new Sqlite(db).executeSQL(
          'SELECT * FROM notes_table ORDER BY updatedAt DESC',
        );
        setNotes(parseResult(results));
      } catch (error) {}
    })();
  }, [isFocused]);

  const addNoteHandler = async request => {
    const {id, title, isStared, createdAt, updatedAt, showTotal} = request;
    try {
      new Sqlite(db).executeSQL(
        'INSERT INTO notes_table (id, title, isStared, createdAt, updatedAt, showTotal) VALUES (?,?,?,?,?,?)',
        [id, title, isStared, createdAt, updatedAt, showTotal],
      );
      setNotes(prev => [request, ...prev]);
    } catch (error) {
      Alert.alert('Something Went Wrong!');
    }
  };

  const deteteNoteAlert = id => {
    const deleteNote = async () => {
      const restNotes = notes.filter(note => note.id != id);
      setNotes(restNotes);
      try {
        const {executeSQL} = new Sqlite(db);
        await Promise.all([
          executeSQL(`DELETE FROM notes_table WHERE id=${id}`),
          executeSQL(`DELETE FROM note_items_table WHERE note_id=${id}`),
        ]);
      } catch (error) {
        console.log(error);
      }
    };
    Alert.alert('Delete Note', 'Are you sure you want to delete this note', [
      {text: 'Cancel'},
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
      await new Sqlite(db).executeSQL(
        `UPDATE notes_table SET isStared=${!star} WHERE id=${id}`,
      );
    } catch (error) {
      console.log(error);
    }
  };

  const downloadFile = obj => {
    const download = async () => {
      const path =
        RNFS.DownloadDirectoryPath +
        `/${obj?.title}-${dateToDMY(Date.now(), '-')}.json`;
      const {results} = await new Sqlite(db).executeSQL(
        `SELECT * FROM note_items_table WHERE note_id=${obj?.id}`,
      );
      obj.noteItems = parseResult(results);
      await RNFS.writeFile(path, JSON.stringify(obj, null, 2), 'utf8');
    };
    Alert.alert('Download', 'Do you want to download this note', [
      {text: 'Cancel'},
      {text: 'OK', onPress: download},
    ]);
  };

  const importFile = async () => {
    try {
      const file = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
      });
      if (file.type !== 'application/json') {
        Alert.alert(
          'Invalid File Type',
          'Please select a valid file type (json)',
        );
        return;
      }
      const data = await RNFS.readFile(file?.uri, 'utf8');
      const noteObject = JSON.parse(data);
      const {id, title, isStared, createdAt, updatedAt, showTotal, noteItems} =
        noteObject;
      const query = createQueryFromArray(noteItems);
      const {executeSQL} = new Sqlite(db);
      await Promise.all([
        executeSQL(
          'INSERT INTO notes_table (id, title, isStared, createdAt, updatedAt, showTotal) VALUES (?,?,?,?,?,?)',
          [id, title, isStared, createdAt, updatedAt, showTotal],
        ),
        executeSQL(query),
      ]);
      setNotes(prev => [
        {id, title, isStared, createdAt, updatedAt, showTotal},
        ...prev,
      ]);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <ScrollView
      className="h-full bg-black-20"
      contentInsetAdjustmentBehavior="automatic">
      <Header
        onShowStared={() => setStaredFilter(prev => (prev === null ? 0 : null))}
        onSelectFile={importFile}
      />
      <AddNotes addNoteHandler={addNoteHandler} />
      <NotesCardContainer
        notes={notes}
        staredFilter={staredFilter}
        onDelete={deteteNoteAlert}
        onStared={starNote}
        navigation={navigation}
        onDownload={downloadFile}
      />
    </ScrollView>
  );
}

export default Notes;
