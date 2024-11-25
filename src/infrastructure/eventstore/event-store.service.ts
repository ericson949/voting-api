import { Injectable } from '@nestjs/common';
import { EventStoreDBClient, FORWARDS, START, jsonEvent } from '@eventstore/db-client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventStoreService {
  private readonly client: EventStoreDBClient;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.get<string>('app.eventStore.connectionString');
    this.client = EventStoreDBClient.connectionString(connectionString);
  }

  async saveEvents(streamName: string, events: any[]): Promise<void> {
    const eventData = events.map(event => 
      jsonEvent({
        type: event.type,
        data: event.data,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      })
    );

    await this.client.appendToStream(streamName, eventData);
  }

  async getEvents(streamName: string): Promise<any[]> {
    const events = [];
    const result = this.client.readStream(streamName, {
      direction: FORWARDS,
      fromRevision: START,
    });

    for await (const resolvedEvent of result) {
      if (resolvedEvent.event) {
        events.push({
          type: resolvedEvent.event.type,
          data: resolvedEvent.event.data,
          metadata: resolvedEvent.event.metadata,
          revision: resolvedEvent.event.revision,
        });
      }
    }

    return events;
  }
}
