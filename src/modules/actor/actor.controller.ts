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
import { ActorService } from './actor.service';
import { CreatedActorDto } from './dtos/created-actor.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { GetActorDto } from './dtos/get-actor.dto';
import { ApiTags } from '@nestjs/swagger';
import { Actor } from '@prisma/client';
@Controller('actor')
@ApiTags('actor')
export class ActorController {
  constructor(private actorService: ActorService) {}

  @Post()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  createActor(@Body() data: CreatedActorDto) {
    return this.actorService.createActor(data);
  }

  @Get()
  getActor(@Query() query: GetActorDto) {
    return this.actorService.getActor(query);
  }

  @Put(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  updateActor(@Body() data: CreatedActorDto, @Param('id') id: string) {
    return this.actorService.updateActor(Number(id), data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  deleteActor(@Param('id') id: string) {
    return this.actorService.deleteActor(Number(id));
  }

  @Get('search')
  search(@Query() query: GetActorDto, @Query('name') name: string): any {
    return this.actorService.search(query, name);
  }
}
