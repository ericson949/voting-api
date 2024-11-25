import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVoteQuery } from '../get-vote.query';
import { VoteRepository } from '../../../infrastructure/persistence/repositories/vote.repository';
import { Vote } from '../../../domain/vote/entities/vote.entity';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetVoteQuery)
export class GetVoteHandler implements IQueryHandler<GetVoteQuery> {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(query: GetVoteQuery): Promise<Vote> {
    const vote = await this.voteRepository.findById(query.id);
    
    if (!vote) {
      throw new NotFoundException(`Vote with ID ${query.id} not found`);
    }

    return vote;
  }
}
