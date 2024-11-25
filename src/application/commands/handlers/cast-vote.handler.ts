import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CastVoteCommand } from '../cast-vote.command';
import { VoteRepository } from '../../../infrastructure/persistence/repositories/vote.repository';
import { Vote } from '../../../domain/vote/entities/vote.entity';

@CommandHandler(CastVoteCommand)
export class CastVoteHandler implements ICommandHandler<CastVoteCommand> {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(command: CastVoteCommand): Promise<Vote> {
    const vote = Vote.create({
      userId: command.userId,
      optionId: command.optionId,
      timestamp: new Date(),
    });

    const savedVote = await this.voteRepository.save(vote);
    return savedVote;
  }
}
