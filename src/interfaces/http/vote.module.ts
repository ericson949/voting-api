import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { VoteController } from './controllers/vote.controller';
import { VoteSchema } from '../../infrastructure/persistence/schemas/vote.schema';
import { VoteRepository } from '../../infrastructure/persistence/repositories/vote.repository';
import { CastVoteHandler } from '../../application/commands/handlers/cast-vote.handler';
import { RevokeVoteHandler } from '../../application/commands/handlers/revoke-vote.handler';
import { GetVoteHandler } from '../../application/queries/handlers/get-vote.handler';
import { GetVoteStatsHandler } from '../../application/queries/handlers/get-vote-stats.handler';

const CommandHandlers = [CastVoteHandler, RevokeVoteHandler];
const QueryHandlers = [GetVoteHandler, GetVoteStatsHandler];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: 'Vote', schema: VoteSchema }]),
  ],
  controllers: [VoteController],
  providers: [
    VoteRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [VoteRepository],
})
export class VoteModule {}
