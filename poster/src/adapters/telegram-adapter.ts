import TelegramBot, { InputMediaPhoto } from 'node-telegram-bot-api';
import { PostWithContent } from '../entities/post';
import * as fs from 'fs';

export class TelegramAdapter {
    private bot: TelegramBot;

    constructor(token: string) {
        this.bot = new TelegramBot(token, { polling: true });
    }

    async sendMessage(post: PostWithContent, chatId: number) {
        // TODO: handle other types
        if (post.content.some(c => c.type !== 'image')) return;

        try {
            const filePaths: string[] = [];

            const media: InputMediaPhoto[] = await Promise.all(post.content.map(async (c, index) => {
                const filePath = `image_${index + 1}.jpg`;
                await fs.promises.writeFile(filePath, Buffer.from(c.content, 'base64'));
                filePaths.push(filePath);
                return {
                    type: 'photo',
                    media: filePath,
                    caption: index === 0 ? post.text : undefined
                };
            }));
            await this.bot.sendMediaGroup(chatId, media);
            await Promise.all(filePaths.map(filePath => fs.promises.unlink(filePath)));
            console.log('Successfully sent and cleared');
        } catch (error) {
            console.error('Error sending images:', error);
        }
    }
}
