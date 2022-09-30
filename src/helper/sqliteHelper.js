export default class SqliteService {
  createTable = async db => {
    return new Promise((resolve, reject) => {
      db.transaction(txn => {
        txn.executeSql(
          `CREATE TABLE IF NOT EXISTS notes_table (id INTEGER PRIMARY KEY, title VARCHAR(30), isStared BOOLEAN, createdAt INTEGER, updatedAt INTEGER)`,
          [],
          (tx, response) => resolve({tx, response}),
          err => reject(err),
        );
      });
    });
  };

  deleteNote = (db, id) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM notes_table WHERE id = ${id}`,
          [],
          (tx, response) => resolve({tx, response}),
          err => reject(err),
        );
      });
    });
  };

  createNoteItemTable = async db => {
    return new Promise((resolve, reject) => {
      db.transaction(txn => {
        txn.executeSql(
          `CREATE TABLE IF NOT EXISTS note_items_table (id INTEGER PRIMARY KEY AUTOINCREMENT, amount INTEGER, label VARCHAR(30), note_id INTEGER)`,
          [],
          (tx, response) => resolve({tx, response}),
          err => reject(err),
        );
      });
    });
  };

  createNoteItem = async (db, request) => {
    const {amount, label, note_id} = request;
    return new Promise((resolve, reject) => {
      db.transaction(txn => {
        txn.executeSql(
          `INSERT INTO note_items_table (amount, label, note_id) VALUES (?,?,?)`,
          [amount, label, note_id],
          (tx, response) => resolve({tx, response}),
          err => reject(err),
        );
      });
    });
  };

  createTables = db => {
    return new Promise((resolve, reject) => {
      Promise.all([this.createTable(db), this.createNoteItemTable(db)])
        .then(resolve)
        .catch(reject);
    });
  };

  deleteNoteItems = (db, note_id) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM note_items_table WHERE note_id=${note_id}`,
          [],
          (tx, response) => resolve({tx, response}),
          err => reject(err),
        );
      });
    });
  };

  executeSQL = (db, query, data = []) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          query,
          data,
          (tx, results) => resolve({tx, results}),
          err => reject(err),
        );
      });
    });
  };
}
