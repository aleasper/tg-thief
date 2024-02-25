import { PostRepo } from "../repositories/post-repository";

export class FetchPostUseCase {
  private postRepo: PostRepo

  constructor(postRepo: PostRepo) {
    this.postRepo = postRepo;
  }

  async execute(id: number) {
    return await this.postRepo.getById(id);
  }
}
  