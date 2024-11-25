import { Test } from '@nestjs/testing';
import { GetVoteStatsQuery, GetVoteStatsHandler } from '../get-vote-stats.query';
import { VoteRepositoryPort } from '../../../domain/vote/repositories/vote.repository.port';
import { Vote } from '../../../domain/vote/entities/vote.entity';

describe('GetVoteStatsHandler', () => {
  let handler: GetVoteStatsHandler;
  let mockVoteRepository: jest.Mocked<VoteRepositoryPort>;

  beforeEach(async () => {
    mockVoteRepository = {
      findByOptionId: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetVoteStatsHandler,
        {
          provide: VoteRepositoryPort,
          useValue: mockVoteRepository,
        },
      ],
    }).compile();

    handler = moduleRef.get<GetVoteStatsHandler>(GetVoteStatsHandler);
  });

  it('should return correct vote statistics', async () => {
    const optionId = 'option123';
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mockVotes = [
      new Vote('vote1', 'user1', optionId, false, today),
      new Vote('vote2', 'user2', optionId, true, yesterday),
      new Vote('vote3', 'user3', optionId, false, today),
    ];

    mockVoteRepository.findByOptionId.mockResolvedValue(mockVotes);

    const query = new GetVoteStatsQuery([optionId]);
    const result = await handler.execute(query);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      optionId,
      totalVotes: 3,
      activeVotes: 2,
      revokedVotes: 1,
      votesOverTime: expect.any(Array),
    });
  });

  it('should handle empty results', async () => {
    const optionId = 'option123';
    mockVoteRepository.findByOptionId.mockResolvedValue([]);

    const query = new GetVoteStatsQuery([optionId]);
    const result = await handler.execute(query);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      optionId,
      totalVotes: 0,
      activeVotes: 0,
      revokedVotes: 0,
      votesOverTime: [],
    });
  });

  it('should handle date filtering', async () => {
    const optionId = 'option123';
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';

    const query = new GetVoteStatsQuery([optionId], startDate, endDate);
    await handler.execute(query);

    expect(mockVoteRepository.findByOptionId).toHaveBeenCalledWith(
      optionId,
      new Date(startDate),
      new Date(endDate)
    );
  });
});
