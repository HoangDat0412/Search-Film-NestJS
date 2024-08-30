import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,

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
import { CreateEpisodeDto } from './dtos/create-episode.dto';
import { UpdateEpisodeDto } from './dtos/update-episode.dto';
import { GetTopMoviesDto } from './dtos/get-top-movies.dto';
import { SearchFilmDto } from './dtos/search-film.dto';
import { UpdateMovieDto } from './dtos/update-movie.dto';

@Controller('movies')
@ApiTags('movies')
@UseFilters(AllExceptionsFilter)
export class MovieController {
  constructor(
    private readonly commentService: CommentService,
    private readonly ratingService: RatingService,
    private readonly movieService: MovieService,
  ) {}

  //######################  Comment ######################

  @Post('comments/:id')
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

  @Get('comments/:id')
  @ApiOperation({ summary: "Get all movie's comment" })
  async getComment(@Param('id') movieId: string) {
    const allComments =
      await this.commentService.fetchAllMovieComment(+movieId);
    return allComments;
  }

  //###################### RATING ######################

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

  // #################### PLAYLIST ######################
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

  //##################### MOVIE ###########################

  @Post()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  createMovie(
    @Body() movieData: CreateMovieDto,
    // @UploadedFile() file: Express.Multer.File,
  ) {
    // const thumb_url = `/uploads/thumbs/${file.filename}`;
    return this.movieService.createMovie(movieData);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  updateMovie(
    @Body() movieData: UpdateMovieDto,
    // @UploadedFile() file: Express.Multer.File,
    @Param('id') movie_id: string,
  ) {
    // const thumb_url = `/uploads/thumbs/${file.filename}`;
    return this.movieService.updateMovie(movieData, +movie_id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async delete(@Param('id') id: string) {
    await this.movieService.deleteMovie(+id);
    return { message: `Movie with ID ${id} deleted successfully` };
  }

  @Get()
  getMovie(@Query() query: GetMovieDto) {
    return this.movieService.getMovie(query);
  }

  @Get('search')
  async searchFilms(@Query() query: SearchFilmDto) {
    return this.movieService.searchFilms(query);
  }

  @Get('top-of-month')
  async getTopMoviesOfMonth(@Query() query: GetTopMoviesDto) {
    try {
      const limit = query.limit || 20; // Default to 20 if limit is not provided
      const movies = await this.movieService.getTopMoviesOfMonth(limit);
      return { movies };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve top movies',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.movieService.getById(Number(id));
  }

  //##################### COUNTRY ###########################

  @Get('countrie/countries')
  async getCountries() {
    return this.movieService.getCountries();
  }

  @Get('filter-by-country/:countrySlug')
  async filterByCountry(
    @Param('countrySlug') countrySlug: string,
    @Query() query: SearchFilmDto,
  ) {
    return this.movieService.filterByCountry(countrySlug, query);
  }

  //##################### YEARS ###########################

  @Get('years/list')
  async getYears() {
    return this.movieService.getYears();
  }

  @Get('year/:year')
  filterByYear(@Param('year') year: string, @Query() query: GetMovieDto) {
    return this.movieService.filterByYear(Number(year), query);
  }
  //##################### GENRES ###########################
  @Get('genres/list')
  async getGenres() {
    return this.movieService.getGenres();
  }

  @Get('genre/:genre')
  filterByGenre(@Param('genre') genre: string, @Query() query: GetMovieDto) {
    return this.movieService.filterByGenre(genre, query);
  }

  //##################### EPISODE ###########################

 
  @Post('episode/:movieId')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  createEpisode(
    @Param('movieId') movie_id: string,
    @Body() data: CreateEpisodeDto,
  ) {
    return this.movieService.createEpisode(Number(movie_id), data);
  }

  // bo movie id
  @Put('episode/:movieId/:episodeId')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
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


  @Delete('episode/:episodeId')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  deleteEpisode(@Param('episodeId') episode_id: string) {
    return this.movieService.deleteEpisode(Number(episode_id));
  }

  @Get('episode/:movieId')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  getEpisode(@Param('movieId') movie_id: string) {
    return this.movieService.getEpisode(Number(movie_id));
  }

  //##################### RATING ###########################

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
