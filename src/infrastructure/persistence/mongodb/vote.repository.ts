import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote as VoteEntity } from '../../../domain/vote/entities/vote.entity';
import { VoteRepositoryPort } from '../../../domain/vote/repositories/vote.repository.port';
import { Vote, VoteDocument } from '../schemas/vote.schema';

@Injectable()
export class MongoVoteRepository implements VoteRepositoryPort {
  constructor(
    @InjectModel(Vote.name)
    private readonly voteModel: Model<VoteDocument>,
  ) {}

  async save(vote: VoteEntity): Promise<VoteEntity> {
    const voteData = {
      _id: vote.getId(),
      userId: vote.getUserId(),
      optionId: vote.getOptionId(),
      revoked: vote.isRevoked(),
      createdAt: vote.getCreatedAt(),
      updatedAt: new Date(),
    };

    let savedDoc: VoteDocument;

    if (vote.getId()) {
      savedDoc = await this.voteModel.findByIdAndUpdate(
        vote.getId(),
        voteData,
        { upsert: true, new: true }
      ).exec();
    } else {
      savedDoc = await this.voteModel.create(voteData);
    }

    return this.toEntity(savedDoc);
  }

  async findById(id: string): Promise<VoteEntity | null> {
    const vote = await this.voteModel.findById(id).exec();
    if (!vote) return null;
    return this.toEntity(vote);
  }

  async findByUserId(userId: string): Promise<VoteEntity[]> {
    const votes = await this.voteModel.find({ userId }).exec();
    return votes.map(vote => this.toEntity(vote));
  }

  async findByOptionId(optionId: string): Promise<VoteEntity[]> {
    const votes = await this.voteModel.find({ optionId, revoked: false }).exec();
    return votes.map(vote => this.toEntity(vote));
  }

  async countByOptionId(optionId: string): Promise<number> {
    return this.voteModel.countDocuments({ optionId, revoked: false }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.voteModel.findByIdAndDelete(id).exec();
  }

  private toEntity(doc: VoteDocument): VoteEntity {
    return new VoteEntity(
      doc._id.toString(),
      doc.userId,
      doc.optionId,
      doc.revoked,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
