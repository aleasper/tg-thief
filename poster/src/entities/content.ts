export class Content {
    id: number;
    postId: number;
    type: string;
    content: string;

    constructor(id: number, postId: number, type: string, content: string) {
        this.id = id;
        this.postId = postId;
        this.type = type;
        this.content = content;
    }
}