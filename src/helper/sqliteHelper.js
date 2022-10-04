export default class SqliteService {
  constructor(db) {
    this.db = db;
  }

  executeSQL = (query, data = []) => {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          query,
          data,
          (tx, results) => resolve({tx, results}),
          err => reject(err),
        );
      });
    });
  };

  createTables = () => {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.executeSQL(
          `CREATE TABLE IF NOT EXISTS notes_table (id INTEGER PRIMARY KEY, title VARCHAR(30), isStared BOOLEAN, createdAt INTEGER, updatedAt INTEGER)`,
        ),
        this.executeSQL(
          `CREATE TABLE IF NOT EXISTS note_items_table (id INTEGER PRIMARY KEY, amount INTEGER, label VARCHAR(30), note_id INTEGER)`,
        ),
      ])
        .then(resolve)
        .catch(reject);
    });
  };
}
