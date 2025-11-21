import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
  .setTitle('GO-CARD MANAGEMENT SYSTEM')
  .setDescription('API documentation powered by Swagger')
  .setVersion('1.0')
  .addBearerAuth() // optional, if you're using JWT
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // localhost:3000/api

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
}
bootstrap();
