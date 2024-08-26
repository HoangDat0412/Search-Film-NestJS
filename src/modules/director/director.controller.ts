import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DirectorService } from './director.service';
import { DirectorDto } from './dto/director.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('directors')
@ApiTags('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

 @Post()
 @ApiOperation({summary: "Add Director"})
 async addDirector (@Body() createDirectorDto: DirectorDto) {
    return await this.directorService.addDirector(createDirectorDto);
 }

 @Put(':id')
 @ApiOperation({summary: "Add Director Name"})
 async editDirector (@Param('id') director_id: string, @Body() editDirectorDto: DirectorDto) {
    return await this.directorService.editDirector(+director_id, editDirectorDto);
 }

  @Get()
  @ApiOperation({summary: "Fetch all Directors"})
  async findAll(
    @Query('page') page: number = 2,
    @Query('pageSize') pageSize: number = 10,
  ) {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const directors = await this.directorService.getAllDirectors(skip, take);
    return directors;
  }
}
