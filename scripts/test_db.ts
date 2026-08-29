import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  try {
    const [rows] = await connection.query('SELECT id, name, email FROM users LIMIT 1');
    console.log('Query successful. Columns exist:', rows);
  } catch (error) {
    console.error('SQL Error:', error);
  } finally {
    await connection.end();
  }
}

main();
