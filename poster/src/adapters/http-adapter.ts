import { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import { DeletePostUseCase } from "../use-cases/delete-post";
import { FetchPostUseCase } from "../use-cases/fetch-post";
import { TelegramAdapter } from './telegram-adapter';

export class HttpAdapter {
    private fetchPostsUseCase: FetchPostUseCase;
    private deletePostsUseCase: DeletePostUseCase;
    private telegramAdapter: TelegramAdapter;

    constructor(fetchPostsUseCase: FetchPostUseCase, deletePostsUseCase: DeletePostUseCase, telegramAdapter: TelegramAdapter) {
        this.fetchPostsUseCase = fetchPostsUseCase;
        this.deletePostsUseCase = deletePostsUseCase;
        this.telegramAdapter = telegramAdapter;
    }
  
    getServerFunc() {
        return (async (req: IncomingMessage, res: ServerResponse) => {
            const { method } = req;
            const { query, pathname } = url.parse(req.url || '', true);
            if (method !== 'POST' || pathname !== '/post') {
                res.writeHead(400);
                res.end();
                return;
            }
            const id = +(query.id || '');
            const dest = +(query.dest || '');
            const post = await this.fetchPostsUseCase.execute(id);
            if (post === null) {
                res.writeHead(404);
                res.end();
                return;
            }
            console.log('sendMessage');
            await this.telegramAdapter.sendMessage(post, dest);
            res.writeHead(200);
            res.end();
            return;
        })
    }
  }
  
  