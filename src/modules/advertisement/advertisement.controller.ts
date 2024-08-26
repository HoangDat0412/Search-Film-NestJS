import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertismentDto } from './dto/advertisement.dto';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/role.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('advertisements')
@ApiTags('advertisment')
export class AdvertisementController {
    constructor(private readonly advertismentService: AdvertisementService){}

    @Post()
    @UseGuards( new RoleGuard(["moderator"]))
    @UseGuards(AuthGuard)
    async createAdvertisement (@Body() createAdvertisementDto: AdvertismentDto) {
        const advertisement = await this.advertismentService.createAdvertisement(createAdvertisementDto);
        return advertisement;
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAllAdvertisment () {
        return await this.advertismentService.getAllAdvertisment();
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getAdvertisementDetail (@Param('id') id: string) {
        return await this.advertismentService.getAdvertisementId(+id)
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async editAdvertisment (@Param('id') id: string, @Body() editAdvertisementDto: AdvertismentDto) {
        return await this.advertismentService.updateAdvertisemnt(+id, editAdvertisementDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async deleteAdvertisement (@Param('id') id: string) {
        return await this.advertismentService.deleteAdvertisment(+id);
    }
}
