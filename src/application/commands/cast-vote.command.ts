export class CastVoteCommand {
  constructor(
    public readonly userId: string,
    public readonly optionId: string,
  ) {}
}

export class CastVoteHandler {
  constructor(private readonly voteRepository: any) {} // We'll type this properly later

  async execute(command: CastVoteCommand): Promise<void> {
    // Implementation will go here
    // 1. Check if user has already voted
    // 2. Create new vote
    // 3. Save vote
    // 4. Publish events
  }
}
