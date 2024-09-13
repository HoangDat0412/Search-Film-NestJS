import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { Country } from '@prisma/client';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';

@Controller('countries')
@ApiTags('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  create(@Body() body: { name: string; slug?: string }): Promise<Country> {
    return this.countryService.create(body);
  }

  @Get()
  findAll(): Promise<Country[]> {
    return this.countryService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  findOne(@Param('id') id: number): Promise<Country> {
    return this.countryService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  update(
    @Param('id') id: number,
    @Body() body: { name?: string; slug?: string },
  ): Promise<Country> {
    return this.countryService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  remove(@Param('id') id: number): Promise<void> {
    return this.countryService.remove(id);
  }

  @Get('search/country')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  search(@Query('name') name: string): Promise<Country[]> {
    return this.countryService.search(name);
  }
}
