import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from '../comment/comment.service';
import { AddCommentDto } from '../comment/dto/add-comment.dto';
import { AddRatingDto } from '../rating/dto/add-rating.dto';
import { RatingService } from '../rating/rating.service';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { MovieService } from './movie.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { CreateMovieDto } from './dtos/create-movie.dto';
import { GetMovieDto } from './dtos/get-movie.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './uploadFile/multer.config';
import { CreateEpisodeDto } from './dtos/create-episode.dto';
import { UpdateEpisodeDto } from './dtos/update-episode.dto';

@Controller('movies')
@ApiTags('movies')
@UseFilters(AllExceptionsFilter)
export class MovieController {
  constructor(
    private readonly commentService: CommentService,
    private readonly ratingService: RatingService,
    private readonly movieService: MovieService,
  ) {}

  @Post(':id/comments')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User Comment Movie' })
  async addComment(
    @Param('id') movieId: string,
    @Body() addCommentDto: AddCommentDto,
    @Req() req: any,
  ) {
    const userId = req.user_data.user_id; //sau thay bang lay token
    const comment = await this.commentService.addComment(
      +movieId,
      +userId,
      addCommentDto,
    );
    return comment;
  }

  @Get(':id/comments')
  @ApiOperation({ summary: "Get all movie's comment" })
  async getComment(@Param('id') movieId: string) {
    const allComments =
      await this.commentService.fetchAllMovieComment(+movieId);
    return allComments;
  }

  @Post(':id/rate')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'User rate movie' })
  async addRating(
    @Param('id') movieId: string,
    @Body() addRatingDto: AddRatingDto,
    @Req() req: any,
  ) {
    const userId = req.user_data.user_id; //sau thay token
    const rating = await this.ratingService.addRating(
      +movieId,
      +userId,
      addRatingDto,
    );
    return rating;
  }

  @Get(':id/rating')
  @ApiOperation({ summary: "Get all movie's rating" })
  async getRating(@Param('id') movieId: string) {
    const rates = await this.ratingService.getRate(+movieId);
    return rates;
  }

  @Post(':id/playlist')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add Movie to user playlist' })
  async addMovieToPlaylist(
    @Param('id') movie_id: string,
    @Body() { category_id }: { category_id: string },
  ) {
    const addMovie = await this.movieService.addMovieToPlaylist(
      +movie_id,
      +category_id,
    );
    return addMovie;
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(new RoleGuard(['admin']))
  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('thumb', multerConfig))
  createMovie(
    @Body() movieData: CreateMovieDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const thumb_url = `/uploads/thumbs/${file.filename}`;
    return this.movieService.createMovie(movieData, thumb_url);
  }

  @Get()
  getMovie(@Query() query: GetMovieDto) {
    console.log(query);

    return this.movieService.getMovie(query);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.movieService.getById(Number(id));
  }

  @Get('genre/:genre')
  filterByGenre(@Param('genre') genre: string, @Query() query: GetMovieDto) {
    return this.movieService.filterByGenre(genre, query);
  }

  @Get('year/:year')
  filterByYear(@Param('year') year: string, @Query() query: GetMovieDto) {
    return this.movieService.filterByYear(Number(year), query);
  }

  @UseGuards(new RoleGuard(['admin', 'content creator']))
  @UseGuards(AuthGuard)
  @Post(':movieId/episode')
  createEpisode(
    @Param('movieId') movie_id: string,
    @Body() data: CreateEpisodeDto,
  ) {
    return this.movieService.createEpisode(Number(movie_id), data);
  }

  // bo movie id
  @UseGuards(new RoleGuard(['admin', 'content creator']))
  @UseGuards(AuthGuard)
  @Put(':movieId/episode/:episodeId')
  updateEpisode(
    @Param('movieId') movie_id: string,
    @Param('episodeId') episode_id: string,
    @Body() data: UpdateEpisodeDto,
  ) {
    return this.movieService.updateEpisode(
      Number(movie_id),
      Number(episode_id),
      data,
    );
  }

  @UseGuards(new RoleGuard(['admin', 'content creator']))
  @UseGuards(AuthGuard)
  @Delete('episode/:episodeId')
  deleteEpisode(@Param('episodeId') episode_id: string) {
    return this.movieService.deleteEpisode(Number(episode_id));
  }

  @Get(':movieId/episode')
  getEpisode(@Param('movieId') movie_id: string) {
    return this.movieService.getEpisode(Number(movie_id));
  }

  @Get(':id/user-rate')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get User Rate for that movie' })
  async getRateByUser(@Param('id') movie_id: string, @Req() req: any) {
    const user_id = req.user_data.user_id;
    const rated = await this.ratingService.getRateByUser(+movie_id, +user_id);
    return rated;
  }

  @Put(':id/change-rate')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update Own Movie rate' })
  async updateOwnReview(
    @Param('id') movie_id: string,
    @Body() { rating_id }: { rating_id: string },
    @Body() editRateDto: AddRatingDto,
    @Req() req: any,
  ) {
    const user_id = req.user_data.user_id;
    const newRate = await this.ratingService.editOwnRate(
      +rating_id,
      +movie_id,
      +user_id,
      editRateDto,
    );
    return newRate;
  }
}
