import { Client } from "pg";
import { Post, PostWithContent } from "../entities/post";
import { Content } from "../entities/content";

export class PostRepo {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async getById(id: number): Promise<PostWithContent | null> {
        const resPost = await this.client.query<Post>(`SELECT * FROM Post WHERE id=${id} LIMIT 1`);
        const resContent = await this.client.query<Content>(`SELECT * FROM Content WHERE postId=${id}`);
        return resPost.rows[0] && resContent.rowCount && resContent.rowCount > 0 ?
            new PostWithContent(resPost.rows[0].id, resPost.rows[0].sourceId, resPost.rows[0].text, resContent.rows)
            :
            null;
    }

    async deleteById(id: number) {
        await this.client.query(`DELETE FROM Content WHERE postId=${id}`);
        await this.client.query(`DELETE FROM Post WHERE id=${id}`);
    }
}