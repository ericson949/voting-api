import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('test-token'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'GOOGLE_CLIENT_ID':
          return 'test-client-id';
        case 'GOOGLE_CLIENT_SECRET':
          return 'test-client-secret';
        case 'GOOGLE_REDIRECT_URI':
          return 'test-redirect-uri';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token', async () => {
      const user = {
        email: 'test@example.com',
        sub: '123',
        roles: ['user'],
      };

      const result = await service.login(user);

      expect(result.access_token).toBeDefined();
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.sub,
        roles: user.roles,
      });
    });

    it('should use default role if none provided', async () => {
      const user = {
        email: 'test@example.com',
        sub: '123',
      };

      const result = await service.login(user);

      expect(result.access_token).toBeDefined();
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.sub,
        roles: ['user'],
      });
    });
  });
});
