import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsOptional, IsArray } from 'class-validator';

export class CastVoteDto {
  @ApiProperty({
    description: 'The ID of the option to vote for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  optionId: string;
}

export class GetVoteStatsDto {
  @ApiProperty({
    description: 'List of option IDs to get statistics for',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    isArray: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  optionIds: string[];

  @ApiProperty({
    description: 'Start date for statistics calculation',
    required: false,
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for statistics calculation',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class VoteResponseDto {
  @ApiProperty({
    description: 'The ID of the vote',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'The ID of the user who cast the vote',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'The ID of the option that was voted for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  optionId: string;

  @ApiProperty({
    description: 'Whether the vote has been revoked',
    example: false,
  })
  isRevoked: boolean;

  @ApiProperty({
    description: 'When the vote was cast',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the vote was last updated',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
