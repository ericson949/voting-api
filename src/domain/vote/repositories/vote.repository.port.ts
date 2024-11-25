import { Vote } from '../entities/vote.entity';

export interface VoteRepositoryPort {
  save(vote: Vote): Promise<Vote>;
  findById(id: string): Promise<Vote | null>;
  findByUserId(userId: string): Promise<Vote[]>;
  findByOptionId(optionId: string): Promise<Vote[]>;
  countByOptionId(optionId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
