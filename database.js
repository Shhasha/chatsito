// Manejo de base de datos SQLite para persistencia de mensajes
// Guarda historial de chat en archivo local

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
  constructor() {
    // Crear/abrir base de datos en archivo local
    const dbPath = path.join(__dirname, 'chat.db');
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error al abrir base de datos:', err);
      } else {
        console.log('Base de datos conectada');
        this.initializeDatabase();
      }
    });
  }
  
  initializeDatabase() {
    const createTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `;
    this.db.run(createTable, (err) => {
      if (err) {
        console.error('Error al crear tabla:', err);
      } else {
        console.log('Tabla de mensajes creada/verificada');
      }
    });
  }
  
  // Agregar mensaje a la base de datos
  addMessage(messageData, callback) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (username, message, timestamp)
      VALUES (?, ?, ?)
    `);
    stmt.run(messageData.username, messageData.message, messageData.timestamp, (err) => {
      if (err) {
        console.error('Error al guardar mensaje:', err);
      }
      if (callback) callback(err);
    });
    stmt.finalize();
  }
  
  // Obtener todos los mensajes del historial
  getMessages(callback) {
    this.db.all(`
      SELECT username, message, timestamp
      FROM messages
      ORDER BY id ASC
    `, (err, rows) => {
      if (err) {
        console.error('Error al obtener mensajes:', err);
        callback(err, []);
      } else {
        callback(null, rows);
      }
    });
  }
  
  // Limpiar historial (opcional, para pruebas)
  clearMessages(callback) {
    this.db.run('DELETE FROM messages', (err) => {
      if (callback) callback(err);
    });
  }
  
  // Cerrar conexión a base de datos
  close() {
    this.db.close((err) => {
      if (err) {
        console.error('Error al cerrar base de datos:', err);
      } else {
        console.log('Base de datos cerrada');
      }
    });
  }
}

module.exports = DatabaseManager;
