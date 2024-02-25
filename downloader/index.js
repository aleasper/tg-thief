const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const { TelegramClient, Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');
const http = require('http');
const url = require('url');

const config = {
  host: 'postgres',
  port:   5432,  
  database: 'db',
  user: 'user',
  password: 'user',
};
const apiId = 772217;
const apiHash = "94d36c985c12bce3ece0f19a0f667b2c";

async function createSessionsTable() {
  const client = new Client(config);
  try {
    await client.connect();
    const command = `
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        session TEXT NOT NULL
      );
    `;
    await client.query(command);
  } catch (err) {
    console.error('Error creating sessions table:', err);
    throw err;
  } finally {
    await client.end();
  }
}

async function getSessionFromDB() {
  const client = new Client(config);
  try {
    await client.connect();
    const query = 'SELECT session FROM sessions WHERE id =  1;';
    const result = await client.query(query);
    return result;
  } catch (err) {
    console.error('Error retrieving session from DB:', err);
    throw err;
  } finally {
    await client.end();
  }
}

async function saveSessionToDB(sessionString) {
  const client = new Client(config);
  try {
    await client.connect();
    const query = `
      INSERT INTO sessions (session) VALUES ($1)
      ON CONFLICT (id) DO UPDATE SET session = EXCLUDED.session
      WHERE sessions.id =  1;
    `;
    await client.query(query, [sessionString]);
  } catch (err) {
    console.error('Error saving session to DB:', err);
    throw err;
  } finally {
    await client.end();
  }
}

async function insertPosts(content) {
  const client = new Client(config);
  try {
    await client.connect();
    const insertPostText = 'INSERT INTO Post(sourceId, text) VALUES($1, $2) RETURNING id;';
    const insertContentText = 'INSERT INTO Content(postId, type, content) VALUES($1, $2, $3);';

    for (const postContent of content) {
      const result = await client.query(insertPostText, [postContent.sourceId, postContent.text]);
      const postId = result.rows[0].id; // This will be the ID of the inserted post

      for (const image of postContent.images) {
        await client.query(insertContentText, [postId, 'image', image]);
      }
    }
  } catch (err) {
    console.error('Error executing query', err.stack);
    throw err;
  } finally {
    await client.end();
  }
}

async function getLastPosts(client, channelId, limit = 1) {
  try {
    await client.start();
    const posts = await client.invoke(
      new Api.messages.GetHistory({
        peer: channelId,
        limit,
        offsetId:  0,
        offsetDate: undefined,
        addOffset:  0,
        maxId:  0,
        minId:  0,
        hash:  0
      })
    );

    return posts.messages;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

const postContents = async (client, posts, sourceId) => {
  return await Promise.all(posts.map(async (message) => {
    const content = {
      text: message.message,
      sourceId,
      images: []
    };
    if (message.media && message.media.className === 'MessageMediaPhoto') {
      const media = message.media;
      const imageBuffer = await client.downloadMedia(media, {
        workers:  5,
      });
      content.images.push(imageBuffer.toString('base64'));
    }
    return content;
  }));
}

const getClient = async () => {
  let session;
  try {
    const result = await getSessionFromDB();
    session = result.rows[0].session;
  } catch (err) {
    console.error('Error retrieving session from DB:', err);
    session = "";
  }
  const client = new TelegramClient(new StringSession(session), apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  await saveSessionToDB(client.session.save());
  return client
}


(async () => {
  await createSessionsTable();
  const client = await getClient();
  http.createServer(async (req, res) => {
    const { method } = req;
    const { query, pathname } = url.parse(req.url, true);
    if (method !== 'POST' || pathname !== '/download' || !query.channel || !query.amount || !query.sourceId) {
      res.writeHead(400)
      res.end('Support only POST /download?channel=123&amount=10&sourceId=1')
      return
    }
    try {
      const posts = await getLastPosts(client, +query.channel, +query.amount)
      const content = await postContents(client, posts, +query.sourceId);
      await insertPosts(content);
      res.writeHead(200)
      res.end();
    } catch (e) {
      console.log(e)
      res.writeHead(500);
      res.end(`Error: ${JSON.stringify(e)}`);
      return
    }
  }).listen(3000);

})();