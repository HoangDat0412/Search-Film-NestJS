import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './modules/all-exceptions/all-exceptions.filter';
import * as path from 'path';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets('uploads', { prefix: '/uploads' });
  app.setViewEngine('hbs'); // Hoặc 'ejs', 'pug', v.v.
  app.setBaseViewsDir(path.join(__dirname, '..', 'src', 'templates')); 
  const config = new DocumentBuilder()
    .setTitle('API Example')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    useGlobalPrefix: true,
  });

  app.enableCors({
    origin: '*', // Cho phép tất cả nguồn gốc
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Các phương thức HTTP được phép
    allowedHeaders: 'Content-Type,Authorization', // Các tiêu đề được phép
  });

  await app.listen(process.env.PORT || 9999);
}
bootstrap();
