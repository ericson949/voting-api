import { Test } from '@nestjs/testing';
import { CastVoteCommand, CastVoteHandler } from '../cast-vote.command';
import { VoteRepositoryPort } from '../../../domain/vote/repositories/vote.repository.port';
import { Vote } from '../../../domain/vote/entities/vote.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CastVoteHandler', () => {
  let handler: CastVoteHandler;
  let mockVoteRepository: jest.Mocked<VoteRepositoryPort>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    mockVoteRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByOptionId: jest.fn(),
    } as any;

    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        CastVoteHandler,
        {
          provide: VoteRepositoryPort,
          useValue: mockVoteRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    handler = moduleRef.get<CastVoteHandler>(CastVoteHandler);
  });

  it('should create and save a new vote', async () => {
    const command = new CastVoteCommand('user123', 'option456');
    const savedVote = new Vote('vote789', 'user123', 'option456');

    mockVoteRepository.save.mockResolvedValue(savedVote);

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(mockVoteRepository.save).toHaveBeenCalled();
    expect(mockEventEmitter.emit).toHaveBeenCalledWith(
      'vote.cast',
      expect.any(Object)
    );
  });

  it('should throw error if vote cannot be saved', async () => {
    const command = new CastVoteCommand('user123', 'option456');

    mockVoteRepository.save.mockRejectedValue(new Error('Database error'));

    await expect(handler.execute(command)).rejects.toThrow('Database error');
  });
});
