import { IEvent } from '@nestjs/cqrs';

export class VoteRevokedEvent implements IEvent {
  constructor(
    public readonly voteId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}
