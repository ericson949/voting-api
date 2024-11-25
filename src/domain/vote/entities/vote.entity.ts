import { AggregateRoot } from '@nestjs/cqrs';

interface VoteCreateProps {
  userId: string;
  optionId: string;
  timestamp: Date;
}

export class Vote extends AggregateRoot {
  constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly optionId: string,
    private revoked: boolean = false,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {
    super();
  }

  static create(props: VoteCreateProps): Vote {
    const id = Math.random().toString(36).substr(2, 9); // Simple ID generation, consider using UUID in production
    return new Vote(
      id,
      props.userId,
      props.optionId,
      false,
      props.timestamp,
      props.timestamp
    );
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getOptionId(): string {
    return this.optionId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  isRevoked(): boolean {
    return this.revoked;
  }

  revoke(): void {
    if (this.revoked) {
      throw new Error('Vote is already revoked');
    }
    this.revoked = true;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      optionId: this.optionId,
      revoked: this.revoked,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
