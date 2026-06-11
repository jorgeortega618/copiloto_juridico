import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Cookie parser middleware — reads cookies from every request
  app.use(cookieParser());

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Para el MVP, permitimos CUALQUIER origen (incluyendo todos los dominios de Vercel y localhost)
      callback(null, true);
    },
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
