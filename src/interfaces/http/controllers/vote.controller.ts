import { Controller, Post, Body, Get, Param, Delete, UseGuards, Query, HttpStatus, Request, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CastVoteCommand } from '../../../application/commands/cast-vote.command';
import { RevokeVoteCommand } from '../../../application/commands/revoke-vote.command';
import { GetVoteQuery } from '../../../application/queries/get-vote.query';
import { GetVoteStatsQuery } from '../../../application/queries/get-vote-stats.query';
import { JwtAuthGuard } from '../../../infrastructure/auth/guards/jwt.guard';
import { RolesGuard } from '../../../infrastructure/auth/guards/roles.guard';
import { Roles } from '../../../infrastructure/auth/decorators/roles.decorator';
import { CastVoteDto, GetVoteStatsDto, VoteResponseDto } from '../dto/vote.dto';
import { CacheTTL, CacheKey } from '@nestjs/cache-manager';

@ApiTags('votes')
@ApiBearerAuth()
@Controller('votes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VoteController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  @Post()
  @Roles('user')
  @ApiOperation({ summary: 'Cast a vote' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vote cast successfully.',
    type: VoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid vote data.',
  })
  async castVote(
    @Body() castVoteDto: CastVoteDto,
    @Request() req
  ): Promise<VoteResponseDto> {
    const command = new CastVoteCommand(
      req.user.userId,
      castVoteDto.optionId,
    );
    const result = await this.commandBus.execute(command);
    // Invalidate cache when new vote is cast
    await this.cacheManager.del(`votes:stats:${command.optionId}`);
    return result;
  }

  @Get(':id')
  @Roles('user')
  @ApiOperation({ summary: 'Get vote by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote retrieved successfully.',
    type: VoteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vote not found.',
  })
  async getVote(@Param('id') id: string): Promise<VoteResponseDto> {
    return this.queryBus.execute(new GetVoteQuery(id));
  }

  @Delete(':id')
  @Roles('user')
  @ApiOperation({ summary: 'Revoke a vote' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vote revoked successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Vote not found.',
  })
  async revokeVote(
    @Param('id') id: string, 
    @Request() req
  ): Promise<void> {
    const command = new RevokeVoteCommand(id, req.user.userId);
    await this.commandBus.execute(command);
    // Invalidate cache when vote is revoked
    await this.cacheManager.reset();
  }

  @Get('statistics')
  @Roles('user')
  @ApiOperation({ summary: 'Get voting statistics' })
  @ApiResponse({
    status: HttpStatus.OK, 
    description: 'Statistics retrieved successfully.' 
  })
  @CacheKey('votes:stats:all')
  @CacheTTL(60 * 1000) // 60 seconds cache in milliseconds
  async getStatistics(
    @Query() query: GetVoteStatsDto
  ) {
    const optionIds = query.optionIds;
    const startDate = query.startDate;
    const endDate = query.endDate;
    const cacheKey = `votes:stats:${optionIds.join(',')}:${startDate}:${endDate}`;
    const cachedResult = await this.cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    const result = await this.queryBus.execute(new GetVoteStatsQuery(optionIds, startDate, endDate));
    await this.cacheManager.set(cacheKey, result, 60 * 1000); // TTL en millisecondes
    return result;
  }
}
