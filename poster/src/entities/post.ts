import { Content } from "./content";

export class Post {
    id: number;
    sourceId: number;
    text: string;

    constructor(id: number, sourceId: number, text: string) {
        this.id = id;
        this.sourceId = sourceId;
        this.text = text;
    }
}

export class PostWithContent extends Post {
    content: Content[];

    constructor(id: number, sourceId: number, text: string, content: Content[]) {
        super(id, sourceId, text);
        this.content = content;
    }
}