import { ICommand, CommandHandler } from '@nestjs/cqrs';
import { VoteRepositoryPort } from '../../domain/vote/repositories/vote.repository.port';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

export class RevokeVoteCommand implements ICommand {
  constructor(
    public readonly voteId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(RevokeVoteCommand)
export class RevokeVoteHandler {
  constructor(private readonly voteRepository: VoteRepositoryPort) {}

  async execute(command: RevokeVoteCommand): Promise<void> {
    const vote = await this.voteRepository.findById(command.voteId);
    
    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    if (vote.getUserId() !== command.userId) {
      throw new UnauthorizedException('User not authorized to revoke this vote');
    }

    vote.revoke();
    await this.voteRepository.save(vote);
  }
}
