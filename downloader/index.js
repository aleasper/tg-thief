const { Client } = require('pg');

// Connection configuration (replace with your actual credentials)
const config = {
  host: 'postgres',
  port:   5432,
  database: 'db',
  user: 'user',
  password: 'user',
};

// Function to create the Posts table if it doesn't exist
async function ensureTableExists(client) {
  const tableName = 'Posts';
    await client.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL
      );
    `);
    console.log(`Table "${tableName}" created.`);
}

// Function to insert random values into the Posts table
async function insertRandomValues() {
  const client = new Client(config);

  try {
    // Connect to the PostgreSQL client
    await client.connect();

    // Ensure the Posts table exists
    await ensureTableExists(client);

    await new Promise((r) => setTimeout(() => r(), 13000));

    // Define the SQL query with placeholders for values
    const text = 'INSERT INTO Posts(title, content) VALUES($1, $2) RETURNING *';

    // Random values to insert
    const values = ['Sample Title', 'This is a sample content.'];

    // Execute the query with the values
    const res = await client.query(text, values);

    console.log('Inserted values:', res.rows[0]);
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    // Close the client connection
    await client.end();
  }
}

// Call the function to insert the values
insertRandomValues();