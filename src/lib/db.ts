import mysql from 'mysql2/promise';

// Create a connection pool instead of a single connection to manage multiple requests
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true, // Allows using named placeholders like :id
});

export default pool;
