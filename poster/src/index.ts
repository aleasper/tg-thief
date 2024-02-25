import { Client } from 'pg';
import 'dotenv/config';
import http from 'http';
import { PostRepo } from './repositories/post-repository';
import { FetchPostUseCase } from './use-cases/fetch-post';
import { DeletePostUseCase } from './use-cases/delete-post';
import { TelegramAdapter } from './adapters/telegram-adapter';
import { HttpAdapter } from './adapters/http-adapter';

const config = {
  host: 'postgres',
  port:   5432,
  database: 'db',
  user: 'user',
  password: 'user',
};
(async() => {
  const client = new Client(config);
  await client.connect();

  const postRepo = new PostRepo(client);

  const fetchPostsUseCase = new FetchPostUseCase(postRepo);
  const deletePostUseCase = new DeletePostUseCase(postRepo);

  const telegramAdapter = new TelegramAdapter(process.env.TELEGRAM_BOT_TOKEN as string);
  const httpAdapter = new HttpAdapter(fetchPostsUseCase, deletePostUseCase, telegramAdapter);

  const server = http.createServer(httpAdapter.getServerFunc());
  const PORT = process.env.PORT ||  3001;

  server.listen(PORT, () => {
    console.log(`Poster running on port ${PORT}`);
  });
  server.on('close', async () => {
    await client.end();
  })
})()