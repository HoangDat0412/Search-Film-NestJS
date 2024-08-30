import { ConfigService } from '@nestjs/config';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
export const mailerConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => ({
  transport: {
    host: configService.get<string>('SMTP_HOST'),
    port: configService.get<number>('SMTP_PORT'),
    auth: {
      user: configService.get<string>('SMTP_USER'),
      pass: configService.get<string>('SMTP_PASS'),
    },
  },
  defaults: {
    from: configService.get<string>('SMTP_FROM'),
  },
  template: {
    dir: join(process.cwd(), 'src', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
});
