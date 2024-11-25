import { Injectable } from '@nestjs/common';
import { VoteRepositoryPort } from '../../domain/vote/repositories/vote.repository.port';

export interface VoteStatistics {
  optionId: string;
  totalVotes: number;
  percentage: number;
}

@Injectable()
export class VoteStatisticsService {
  constructor(private readonly voteRepository: VoteRepositoryPort) {}

  async getStatisticsByOption(optionIds: string[]): Promise<VoteStatistics[]> {
    const statistics: VoteStatistics[] = [];
    let totalVotes = 0;

    // Calculer le total des votes
    for (const optionId of optionIds) {
      const count = await this.voteRepository.countByOptionId(optionId);
      totalVotes += count;
      statistics.push({
        optionId,
        totalVotes: count,
        percentage: 0, // Sera calculé après
      });
    }

    // Calculer les pourcentages
    if (totalVotes > 0) {
      statistics.forEach(stat => {
        stat.percentage = (stat.totalVotes / totalVotes) * 100;
      });
    }

    return statistics;
  }

  async exportToCsv(optionIds: string[]): Promise<string> {
    const statistics = await this.getStatisticsByOption(optionIds);
    
    // En-tête CSV
    let csv = 'Option ID,Total Votes,Percentage\n';
    
    // Données
    statistics.forEach(stat => {
      csv += `${stat.optionId},${stat.totalVotes},${stat.percentage.toFixed(2)}%\n`;
    });

    return csv;
  }
}
