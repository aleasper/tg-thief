import { PostRepo } from "../repositories/post-repository";

export class DeletePostUseCase {
  private postRepo: PostRepo

  constructor(postRepo: PostRepo) {
    this.postRepo = postRepo;
  }

  async execute(id: number) {
    return await this.postRepo.deleteById(id);
  }
}
  