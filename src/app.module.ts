import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { CommentModule } from './modules/comment/comment.module';
import { MovieModule } from './modules/movie/movie.module';
import { RatingModule } from './modules/rating/rating.module';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ActorModule } from './modules/actor/actor.module';
import { GenreModule } from './modules/genre/genre.module';
import { ReportBugModule } from './modules/report-bug/report-bug.module';
import { RequestFeatureModule } from './modules/request-feature/request-feature.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';
import { DirectorModule } from './modules/director/director.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from './config/mailer.config';
import { CountryModule } from './modules/country/country.module';
import { BlogModule } from './modules/blog/blog.module';
import { WatchlistModule } from './modules/watchlist/watchlist.module';
import { WatchHistoryModule } from './modules/watch-history/watch-history.module';
import { CrawlFilmModule } from './modules/crawl-film/crawl-film.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    CommentModule,
    MovieModule,
    RatingModule,
    PlaylistModule,
    NotificationModule,
    AuthModule,
    JwtModule,
    JwtModule.register({}),
    ReportBugModule,
    RequestFeatureModule,
    AdvertisementModule,
    DirectorModule,
    ActorModule,
    GenreModule,
    CountryModule,
    BlogModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: mailerConfig,
      inject: [ConfigService],
    }),
    WatchlistModule,
    WatchHistoryModule,
    CrawlFilmModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
