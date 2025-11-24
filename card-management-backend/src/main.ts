// import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
// import { AppModule } from './app.module';
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.useGlobalPipes(
//     new ValidationPipe({
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       transform: true,
//     }),
//   );
//   const config = new DocumentBuilder()
//     .setTitle('GO-CARD MANAGEMENT SYSTEM')
//     .setDescription('API documentation powered by Swagger')
//     .setVersion('1.0')
//     .addBearerAuth(
//       {
//         type: 'http',
//         scheme: 'bearer',
//         bearerFormat: 'JWT',
//         in: 'header',
//       },
//       'access-token', // <-- your auth key name
//     )
//     .build();

//   const document = SwaggerModule.createDocument(app, config);

//   SwaggerModule.setup('api', app, document, {
//     swaggerOptions: {
//       deepLinking: true,
//       persistAuthorization: true,
//       displayRequestDuration: true,
//     },
//     customSiteTitle: 'Card Management API',
//   });

//   await app.listen(3000);
//   console.log('🚀 Server running on http://localhost:3000');
// }
// bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ENABLE CORS - Add this BEFORE other configurations
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.js
      'http://localhost:3001', // React (Create React App)
      'http://localhost:5173', // Vite
      'http://localhost:4200', // Angular
      'http://localhost:8080', // Vue
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GO-CARD MANAGEMENT SYSTEM')
    .setDescription('API documentation powered by Swagger')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token', // <-- your auth key name
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Card Management API',
  });

  await app.listen(3000);
  console.log('🚀 Server running on http://localhost:3000');
  console.log('📖 API Documentation: http://localhost:3000/api');
  console.log('📡 CORS enabled for frontend development');
}
bootstrap();
