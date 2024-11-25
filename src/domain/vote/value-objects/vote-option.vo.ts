export class VoteOption {
  constructor(
    private readonly id: string,
    private readonly title: string,
    private readonly description: string,
  ) {
    this.validateTitle(title);
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Vote option title cannot be empty');
    }
    if (title.length > 100) {
      throw new Error('Vote option title cannot be longer than 100 characters');
    }
  }

  getId(): string {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }
}
