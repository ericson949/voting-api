import { Vote } from '../vote.entity';

describe('Vote Entity', () => {
  let vote: Vote;
  const voteId = '123';
  const userId = 'user123';
  const optionId = 'option123';

  beforeEach(() => {
    vote = new Vote(voteId, userId, optionId);
  });

  it('should create a vote instance', () => {
    expect(vote).toBeDefined();
    expect(vote.getId()).toBe(voteId);
    expect(vote.getUserId()).toBe(userId);
    expect(vote.getOptionId()).toBe(optionId);
    expect(vote.isVoteRevoked()).toBe(false);
  });

  it('should revoke a vote', () => {
    vote.revokeVote();
    expect(vote.isVoteRevoked()).toBe(true);
  });

  it('should throw error when revoking already revoked vote', () => {
    vote.revokeVote();
    expect(() => vote.revokeVote()).toThrow('Vote is already revoked');
  });
});
