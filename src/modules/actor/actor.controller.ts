import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ActorService } from './actor.service';
import { CreatedActorDto } from './dtos/created-actor.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { GetActorDto } from './dtos/get-actor.dto';

@Controller('actor')
export class ActorController {
    constructor (private actorService: ActorService) {}

    @UseGuards(new RoleGuard(["admin", "content creator", ""]))
    @UseGuards(AuthGuard)
    @Post()
    createActor(@Body() data: CreatedActorDto) {
        return this.actorService.createActor(data)
    }

    @Get()
    getActor(@Query() query: GetActorDto) {
        return this.actorService.getActor(query)
    }

    @UseGuards(new RoleGuard(["admin", "content creator", ""]))
    @UseGuards(AuthGuard)
    @Put(":id")
    updateActor(@Body() data: CreatedActorDto, @Param('id') id: string) {
        return this.actorService.updateActor(Number(id), data)
    }

    @UseGuards(new RoleGuard(["admin", "content creator", ""]))
    @UseGuards(AuthGuard)
    @Delete(":id")
    deleteActor(@Param('id') id: string) {
        return this.actorService.deleteActor(Number(id))
    }
}