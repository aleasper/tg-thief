const { Client } = require('pg');

// Connection configuration (replace with your actual credentials)
const config = {
  host: 'postgres',
  port:   5432,
  database: 'db',
  user: 'user',
  password: 'user',
};

// Function to fetch all records from the Posts table
async function fetchAllPosts(client) {
  const res = await client.query('SELECT * FROM Posts');
  return res.rows;
}

// Function to print all posts
async function printPosts() {
  const client = new Client(config);

  try {
    // Connect to the PostgreSQL client
    await client.connect();

    // Fetch all posts and print them
    const posts = await fetchAllPosts(client);
    console.log('Current posts:', JSON.stringify(posts));
  } catch (err) {
    console.error('Error fetching posts', err.stack);
  } finally {
    // Close the client connection
    await client.end();
  }
}

// Set up an infinite loop to print posts every  5 seconds
setInterval(printPosts,  5000);