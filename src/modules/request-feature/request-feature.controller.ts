import { Body, Controller, Delete, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { RequestFeatureService } from './request-feature.service';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('request-feature')
@ApiTags('request-feature')
export class RequestFeatureController {

    constructor(private readonly requestFeatureService: RequestFeatureService) {}

    @Post('feature')
    @UseGuards(AuthGuard)
    @UseFilters(AllExceptionsFilter)
    async createReportBug (@Body() createFeatureReqDto: CreateFeatureRequestDto, @Req() req: any) {
        const user_id = req.user_data.user_id;
        const report = await this.requestFeatureService.createReqFeature(+user_id, createFeatureReqDto);
        return report;
    }


    @Get('feature')
    @UseGuards(AuthGuard)
    async getReports () {
        const reports = await this.requestFeatureService.getReqFeature();
        return reports;
    }

    @Delete('feature')
    @UseGuards(AuthGuard)
    async deleteReport (@Body() {id}: {id; string}) {
        const report = await this.requestFeatureService.deleteReqFeature(+id);
        return report;
    }
}
