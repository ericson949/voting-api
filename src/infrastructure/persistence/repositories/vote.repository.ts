import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vote as VoteEntity } from '../../../domain/vote/entities/vote.entity';
import { VoteRepositoryPort } from '../../../domain/vote/repositories/vote.repository.port';
import { Vote, VoteDocument } from '../schemas/vote.schema';

@Injectable()
export class VoteRepository implements VoteRepositoryPort {
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

    const id = vote.getId();
    if (id) {
      const doc = await this.voteModel.findByIdAndUpdate(id, voteData, { upsert: true, new: true }).exec();
      return new VoteEntity(
        doc._id.toString(),
        doc.userId,
        doc.optionId,
        doc.revoked,
        doc.createdAt,
        doc.updatedAt
      );
    } else {
      const doc = await new this.voteModel(voteData).save();
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

  async findById(id: string): Promise<VoteEntity | null> {
    const doc = await this.voteModel.findById(id).exec();
    if (!doc) {
      return null;
    }

    return new VoteEntity(
      doc._id.toString(),
      doc.userId,
      doc.optionId,
      doc.revoked,
      doc.createdAt,
      doc.updatedAt
    );
  }

  async findByUserId(userId: string): Promise<VoteEntity[]> {
    const docs = await this.voteModel.find({ userId }).exec();
    return docs.map(doc => new VoteEntity(
      doc._id.toString(),
      doc.userId,
      doc.optionId,
      doc.revoked,
      doc.createdAt,
      doc.updatedAt
    ));
  }

  async findByOptionId(optionId: string): Promise<VoteEntity[]> {
    const docs = await this.voteModel.find({ optionId, revoked: false }).exec();
    return docs.map(doc => new VoteEntity(
      doc._id.toString(),
      doc.userId,
      doc.optionId,
      doc.revoked,
      doc.createdAt,
      doc.updatedAt
    ));
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
      doc.createdAt
    );
  }
}
