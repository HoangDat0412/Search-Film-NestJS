import { Body, Controller, Delete, Get, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import { ReportBugService } from './report-bug.service';
import { CreateBugReportDto } from './dto/create-report-bug.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { ApiTags } from '@nestjs/swagger';

@Controller('report-bug')
@ApiTags('report-bug')
export class ReportBugController {
    constructor(private readonly reportBugService: ReportBugService) {}

    @Post('reportbug')
    @UseGuards(AuthGuard)
    @UseFilters(AllExceptionsFilter)
    async createReportBug (@Body() createReportBugDto: CreateBugReportDto, @Req() req: any) {
        const user_id = req.user_data.user_id;
        const report = await this.reportBugService.createReportBug(+user_id, createReportBugDto);
        return report;
    }


    @Get('reportbug')
    @UseGuards(AuthGuard)
    async getReports () {
        const reports = await this.reportBugService.getReportBugs();
        return reports;
    }

    @Delete('reportbug')
    @UseGuards(AuthGuard)
    async deleteReport (@Body() {id}: {id; string}) {
        const report = await this.reportBugService.deleteReportBug(+id);
        return report;
    }
}
