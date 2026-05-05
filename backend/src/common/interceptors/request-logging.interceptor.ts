import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';

const REDACTED_FIELDS = new Set([
  'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
  'authorization', 'secret', 'apiKey',
]);

function redactBody(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== 'object') return body;
  const result: Record<string, any> = {};
  for (const key of Object.keys(body)) {
    result[key] = REDACTED_FIELDS.has(key) ? '[REDACTED]' : body[key];
  }
  return result;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');
  private readonly debugBodyLogs = process.env.API_DEBUG_BODY_LOGS === 'true';
  private readonly requestLogging = process.env.API_REQUEST_LOGGING !== 'false';

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.requestLogging) return next.handle();

    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const startMs = Date.now();
    const requestId = (req as any).requestId || 'unknown';
    const method = req.method;
    const path = req.originalUrl;
    const user = (req as any).user;
    const userInfo = user
      ? `userType=${user.type || 'unknown'} userId=${user.id || user.sub || 'unknown'} role=${user.role || '-'}`
      : 'unauthenticated';

    return next.handle().pipe(
      tap({
        next: () => {
          const status = res.statusCode;
          const durationMs = Date.now() - startMs;
          this.logger.log(
            `[REQUEST] requestId=${requestId} method=${method} path=${path} status=${status} durationMs=${durationMs} ${userInfo}`,
          );
          if (this.debugBodyLogs && req.body && Object.keys(req.body).length > 0) {
            this.logger.debug(
              `[REQUEST_BODY] requestId=${requestId} body=${JSON.stringify(redactBody(req.body))}`,
            );
          }
        },
        error: (err) => {
          const status = err?.status || err?.response?.statusCode || 500;
          const durationMs = Date.now() - startMs;
          const message = err?.message || 'Unknown error';
          if (status >= 500) {
            this.logger.error(
              `[REQUEST_ERROR] requestId=${requestId} method=${method} path=${path} status=${status} durationMs=${durationMs} ${userInfo} message="${message}"`,
              err?.stack,
            );
          } else {
            this.logger.warn(
              `[REQUEST_WARN] requestId=${requestId} method=${method} path=${path} status=${status} durationMs=${durationMs} ${userInfo} message="${message}"`,
            );
          }
        },
      }),
    );
  }
}
