import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug', 'verbose'],
  });
  const configService = app.get(ConfigService);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Request ID middleware — must run before guards/interceptors
  const requestIdMiddleware = new RequestIdMiddleware();
  app.use((req: any, res: any, next: any) => requestIdMiddleware.use(req, res, next));

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global interceptor for request logging
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  // Global exception filter — returns requestId in error bodies, never leaks stack to frontend
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // CORS configuration from environment
  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  app.enableCors({
    origin: corsOrigins ? corsOrigins.split(',').map(s => s.trim()) : '*',
    credentials: true,
    exposedHeaders: ['x-request-id'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('GJXpress API')
    .setDescription('GJ Supply Chain Service – Logistic OS')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`GJXpress API running on http://localhost:${port}/api`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
  console.log(`Health check: http://localhost:${port}/api/health`);
}

bootstrap();
