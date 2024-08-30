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
import { DirectorService } from './director.service';
import { DirectorDto } from './dto/director.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { GetDirectorsDto } from './dto/get-directors.dto';

@Controller('directors')
@ApiTags('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Post()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async addDirector(@Body() createDirectorDto: DirectorDto) {
    return await this.directorService.addDirector(createDirectorDto);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async editDirector(
    @Param('id') director_id: string,
    @Body() editDirectorDto: DirectorDto,
  ) {
    return await this.directorService.editDirector(
      +director_id,
      editDirectorDto,
    );
  }

  @Get()
  getAllDirectors(@Query() query: GetDirectorsDto) {
    return this.directorService.getAllDirectors(query);
  }

  @Get('search/director')
  searchDirectors(
    @Query() query: GetDirectorsDto,
    @Query('name') name: string,
  ): any {
    return this.directorService.searchDirectors(query, name);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  deleteDirector(@Param('id') id: number): Promise<void> {
    return this.directorService.deleteDirector(id);
  }
}
