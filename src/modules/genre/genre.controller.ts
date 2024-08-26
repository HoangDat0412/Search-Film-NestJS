import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { GetGenreDto } from './dtos/get-genre.dto';

@Controller('genre')
export class GenreController {
    constructor(private genreService: GenreService) {}

    @UseGuards(new RoleGuard(["admin", "content creator"]))
    @UseGuards(AuthGuard)
    @Post() 
    createGenre(@Body() data: CreateGenreDto) {
        return this.genreService.createGenre(data)
    }

    @UseGuards(new RoleGuard(["admin", "content creator"]))
    @UseGuards(AuthGuard)
    @Put(":id") 
    updateGenre(@Param("id") id:string ,@Body() data: CreateGenreDto) {
        return this.genreService.updateGenre(Number(id), data)
    }

    @UseGuards(new RoleGuard(["admin", "content creator"]))
    @UseGuards(AuthGuard)
    @Delete(":id") 
    deleteGenre(@Param("id") id:string) {
        return this.genreService.deleteGenre(Number(id))
    }

    @Get()
    getGenre(@Query() query: GetGenreDto) {
        return this.genreService.getGenre(query)
    }
}