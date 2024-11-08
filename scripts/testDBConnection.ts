// scripts/testDBConnection.ts
import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

console.log(process.env.DATABASE_URL);
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Successfully connected to the database');
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    await client.end();
  }
}

testConnection();