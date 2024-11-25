import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema({
  timestamps: true,
  collection: 'votes',
})
export class Vote {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  optionId: string;

  @Prop({ default: false })
  revoked: boolean;

  @Prop({ required: true })
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VoteSchema = SchemaFactory.createForClass(Vote);
