import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVoteStatsQuery } from '../get-vote-stats.query';
import { VoteRepository } from '../../../infrastructure/persistence/repositories/vote.repository';

interface VoteStats {
  optionId: string;
  count: number;
}

@QueryHandler(GetVoteStatsQuery)
export class GetVoteStatsHandler implements IQueryHandler<GetVoteStatsQuery> {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(query: GetVoteStatsQuery): Promise<VoteStats[]> {
    const stats: VoteStats[] = [];

    for (const optionId of query.optionIds) {
      const count = await this.voteRepository.countByOptionId(optionId);
      stats.push({ optionId, count });
    }

    return stats;
  }
}
