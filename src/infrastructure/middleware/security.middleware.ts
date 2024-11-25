import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import * as csurf from 'csurf';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  private setupRateLimit() {
    return rateLimit({
      windowMs: this.configService.get<number>('app.security.rateLimitTtl') * 1000,
      max: this.configService.get<number>('app.security.rateLimitMax'),
    });
  }

  private setupCsrf() {
    return csurf({ cookie: true });
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Apply Helmet security headers
    helmet()(req, res, () => {
      // Apply rate limiting
      this.setupRateLimit()(req, res, () => {
        // Apply CSRF protection for non-GET requests
        if (req.method !== 'GET') {
          this.setupCsrf()(req, res, next);
        } else {
          next();
        }
      });
    });
  }
}
