import cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.SERVER_PORT || 3333;

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  
  app.use(cookieParser());

  await app.listen(port);
}
bootstrap();
