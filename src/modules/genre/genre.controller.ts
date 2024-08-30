import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { GetGenreDto } from './dtos/get-genre.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('genre')
@ApiTags('genre')
export class GenreController {
  constructor(private genreService: GenreService) {}

  @Post()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  createGenre(@Body() data: CreateGenreDto) {
    return this.genreService.createGenre(data);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  updateGenre(@Param('id') id: string, @Body() data: CreateGenreDto) {
    return this.genreService.updateGenre(Number(id), data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  deleteGenre(@Param('id') id: string) {
    return this.genreService.deleteGenre(Number(id));
  }

  @Get()
  getAllGenres(@Query() query: GetGenreDto) {
    return this.genreService.getAllGenres(query);
  }

  @Get('search/genre')
  searchGenres(@Query() query: GetGenreDto) {
    return this.genreService.searchGenres(query);
  }
}
