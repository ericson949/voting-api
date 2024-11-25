import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { VoteRepositoryPort } from '../../domain/vote/repositories/vote.repository.port';

export class GetVoteStatsQuery implements IQuery {
  constructor(
    public readonly optionIds: string[],
    public readonly startDate?: string,
    public readonly endDate?: string,
  ) {}
}

export interface VoteStats {
  optionId: string;
  totalVotes: number;
  activeVotes: number;
  revokedVotes: number;
  votesOverTime?: {
    date: string;
    count: number;
  }[];
}

@QueryHandler(GetVoteStatsQuery)
export class GetVoteStatsHandler implements IQueryHandler<GetVoteStatsQuery> {
  constructor(private readonly voteRepository: VoteRepositoryPort) {}

  async execute(query: GetVoteStatsQuery): Promise<VoteStats[]> {
    const stats: VoteStats[] = [];

    for (const optionId of query.optionIds) {
      const votes = await this.voteRepository.findByOptionId(optionId);
      
      const activeVotes = votes.filter(v => !v.isRevoked()).length;
      const revokedVotes = votes.filter(v => v.isRevoked()).length;

      stats.push({
        optionId,
        totalVotes: votes.length,
        activeVotes,
        revokedVotes,
        votesOverTime: this.calculateVotesOverTime(votes),
      });
    }

    return stats;
  }

  private calculateVotesOverTime(votes: any[]): { date: string; count: number }[] {
    const votesPerDay = new Map<string, number>();

    votes.forEach(vote => {
      const date = vote.getCreatedAt().toISOString().split('T')[0];
      votesPerDay.set(date, (votesPerDay.get(date) || 0) + 1);
    });

    return Array.from(votesPerDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
