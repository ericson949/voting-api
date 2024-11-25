import { IQuery } from '@nestjs/cqrs';
import { Vote } from '../../domain/vote/entities/vote.entity';

export class GetVoteQuery implements IQuery {
  constructor(public readonly id: string) {}
}

export class GetVoteHandler {
  constructor(private readonly voteRepository: any) {}

  async execute(query: GetVoteQuery): Promise<Vote> {
    const vote = await this.voteRepository.findById(query.id);
    if (!vote) {
      throw new Error('Vote not found');
    }
    return vote;
  }
}

export class GetVotesByOptionQuery implements IQuery {
  constructor(
    public readonly optionId: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}

export class GetVotesByOptionHandler {
  constructor(private readonly voteRepository: any) {}

  async execute(query: GetVotesByOptionQuery): Promise<Vote[]> {
    return this.voteRepository.findByOptionId(query.optionId);
  }
}
