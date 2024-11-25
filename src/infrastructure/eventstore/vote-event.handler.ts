import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { EventStoreService } from './event-store.service';
import { VoteCastEvent } from '../../domain/vote/events/vote-cast.event';
import { VoteRevokedEvent } from '../../domain/vote/events/vote-revoked.event';

@Injectable()
@EventsHandler(VoteCastEvent)
export class VoteCastEventHandler implements IEventHandler<VoteCastEvent> {
  constructor(private readonly eventStore: EventStoreService) {}

  async handle(event: VoteCastEvent) {
    await this.eventStore.saveEvents(`vote-${event.voteId}`, [{
      type: 'VoteCast',
      data: {
        voteId: event.voteId,
        userId: event.userId,
        optionId: event.optionId,
        timestamp: event.timestamp,
      }
    }]);

    // Add to global stream
    await this.eventStore.saveEvents('votes-all', [{
      type: 'VoteCast',
      data: {
        voteId: event.voteId,
        userId: event.userId,
        optionId: event.optionId,
        timestamp: event.timestamp,
      }
    }]);
  }
}

@Injectable()
@EventsHandler(VoteRevokedEvent)
export class VoteRevokedEventHandler implements IEventHandler<VoteRevokedEvent> {
  constructor(private readonly eventStore: EventStoreService) {}

  async handle(event: VoteRevokedEvent) {
    await this.eventStore.saveEvents(`vote-${event.voteId}`, [{
      type: 'VoteRevoked',
      data: {
        voteId: event.voteId,
        timestamp: event.timestamp,
      }
    }]);

    // Add to global stream
    await this.eventStore.saveEvents('votes-all', [{
      type: 'VoteRevoked',
      data: {
        voteId: event.voteId,
        timestamp: event.timestamp,
      }
    }]);
  }
}
