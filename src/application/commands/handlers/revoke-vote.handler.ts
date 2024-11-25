import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeVoteCommand } from '../revoke-vote.command';
import { VoteRepository } from '../../../infrastructure/persistence/repositories/vote.repository';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(RevokeVoteCommand)
export class RevokeVoteHandler implements ICommandHandler<RevokeVoteCommand> {
  constructor(private readonly voteRepository: VoteRepository) {}

  async execute(command: RevokeVoteCommand): Promise<void> {
    const vote = await this.voteRepository.findById(command.voteId);
    
    if (!vote) {
      throw new NotFoundException(`Vote with ID ${command.voteId} not found`);
    }

    if (vote.getUserId() !== command.userId) {
      throw new NotFoundException('Vote not found'); // Security through obscurity
    }

    vote.revoke();
    await this.voteRepository.save(vote);
  }
}
