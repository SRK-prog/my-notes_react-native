export default class SqliteService {
  createTable = async db => {
    return new Promise((resolve, reject) => {
      db.transaction(txn => {
        txn.executeSql(
          `CREATE TABLE IF NOT EXISTS notes_table (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(30), isStared BOOLEAN, createdAt INTEGER, updatedAt INTEGER)`,
          [],
          (tx, res) => {
            resolve({
              tx,
              response: res,
            });
          },
          err => reject(err),
        );
      });
    });
  };

  getNotes = db => {
    return new Promise(resolve => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM notes_table',
          [],
          (tx, results) => {
            const notesArray = [];
            for (let i = 0; i < results.rows.length; ++i) {
              notesArray.push(results.rows.item(i));
            }
            const sorted = notesArray.sort(
              (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
            );
            resolve(sorted);
          },
          () => resolve([]),
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

  updateStar = (db, id, isStared) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE notes_table SET isStared=${isStared} WHERE id=${id}`,
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

  getNoteItems = async (db, note_id) => {
    return new Promise((resolve, reject) => {
      db.transaction(txn => {
        txn.executeSql(
          `SELECT * FROM note_items_table WHERE note_id=${note_id}`,
          [],
          (tx, results) => {
            const array = [];
            for (let i = 0; i < results.rows.length; ++i) {
              array.push(results.rows.item(i));
            }
            resolve(array);
          },
          err => reject(err),
        );
      });
    });
  };

  updateNoteUpdateAt = (db, id) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE notes_table SET updatedAt=${Date.now()} WHERE id=${id}`,
          [],
          (tx, response) => resolve({tx, response}),
          err => reject(err),
        );
      });
    });
  };

  createTables = db => {
    return new Promise((resolve, reject) => {
      Promise.all([this.createTable(), this.createNoteItemTable(db)])
        .then(resolve)
        .catch(reject);
    });
  };

  deleteNoteItems = (db, id) => {
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
}
