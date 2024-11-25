import { IEvent } from '@nestjs/cqrs';

export class VoteCastEvent implements IEvent {
  constructor(
    public readonly voteId: string,
    public readonly userId: string,
    public readonly optionId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class VoteRevokedEvent {
  constructor(
    public readonly voteId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
