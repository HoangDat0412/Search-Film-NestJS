import {
  BadRequestException,
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
import { MovieRankingDto } from './dtos/movie-ranking.dto';
import { FilterMovieDto } from './dtos/filter-movie.dto';
import { validate } from 'class-validator';
import { FilterMostViewDTO } from './dtos/filter-most-view.dto';

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

  // @Get(':id/rating')
  // @ApiOperation({ summary: "Get all movie's rating" })
  // async getRating(@Param('id') movieId: string) {
  //   // const rates = await this.ratingService.getRate(+movieId);
  //   // return rates;
  // }
  @Get(':id/rating')
  @UseGuards(AuthGuard)
  async getMovieRatings(@Param('id') movieId: string, @Req() req: any) {
    const userId = req.user_data.user_id; //sau thay token
    return this.ratingService.getMovieRatings(+movieId, +userId);
  }

  @Get('usergetrating/:movieId')
  async getUserRating(
    @Param('movieId') movieId: string,
    @Req() req: any,
  ): Promise<any> {
    // Gọi service để lấy đánh giá
    return this.ratingService.getRatingByUserAndMovie(
      +req.user_data.user_id,
      +movieId,
    );
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

  @Get('ranking/search')
  async getMovieRanking(@Query() movieRankingDto: MovieRankingDto) {
    return this.movieService.getRankedMovies(movieRankingDto);
  }

  @Get('filter/search')
  async filterMovies(@Query() query: any) {
    const filters: FilterMovieDto = {
      movie_country: query.movie_country
        ? parseInt(query.movie_country, 10)
        : undefined,
      year: query.year ? parseInt(query.year, 10) : undefined,
      movie_genre: query.movie_genre
        ? parseInt(query.movie_genre, 10)
        : undefined,
      search_query: query.search_query,
      tmdb_vote_average: query.tmdb_vote_average
        ? parseFloat(query.tmdb_vote_average)
        : undefined,
      page: query.page ? parseInt(query.page, 10) : undefined,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : undefined,
    };

    // Validate DTO
    const validatedFilters = new FilterMovieDto();
    Object.assign(validatedFilters, filters);
    const errors = await validate(validatedFilters);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.movieService.filterMovies(validatedFilters);
  }

  @Get('filter/mostview')
  async getMoviesFiltered(@Query() filterMostViewDTO: FilterMostViewDTO) {
    return this.movieService.getFilteredMovies(filterMostViewDTO);
  }

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

  @Get('view/:movieId')
  async incrementView(@Param('movieId') movieId: string): Promise<void> {
    // Gọi service để tăng lượt xem
    return this.movieService.incrementView(+movieId);
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
