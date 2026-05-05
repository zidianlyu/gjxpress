import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');
  private readonly isProd = process.env.NODE_ENV === 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = (req as any).requestId || 'unknown';

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exRes = exception.getResponse();
      if (typeof exRes === 'string') {
        message = exRes;
        error = exception.name;
      } else if (typeof exRes === 'object' && exRes !== null) {
        const r = exRes as Record<string, any>;
        message = Array.isArray(r['message']) ? r['message'].join('; ') : (r['message'] || exception.message);
        error = r['error'] || exception.name;
      } else {
        message = exception.message;
        error = exception.name;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'InternalServerError';
      this.logger.error(
        `[UNHANDLED] requestId=${requestId} method=${req.method} path=${req.originalUrl} message="${(exception as Error)?.message}"`,
        (exception as Error)?.stack,
      );
    }

    if (status >= 500) {
      this.logger.error(
        `[HTTP_ERROR] requestId=${requestId} method=${req.method} path=${req.originalUrl} status=${status} message="${message}"`,
        !this.isProd && exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: Record<string, any> = {
      statusCode: status,
      error,
      message,
      requestId,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    res.status(status).json(body);
  }
}
