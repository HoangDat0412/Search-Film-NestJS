import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureRequestDto } from './dto/create-feature-request.dto';

@Injectable()
export class RequestFeatureService {

    constructor (private prisma: PrismaService){}

    async createReqFeature (user_id: number, CreateFeatureRequestDto: CreateFeatureRequestDto) {
        return await this.prisma.requestFeature.create({
            data: {
                title: CreateFeatureRequestDto.title,
                description: CreateFeatureRequestDto.description,
                user: {connect: {
                    user_id
                }}
            }
        })
    }

    async getReqFeature () {
        const reports = await this.prisma.requestFeature.findMany();
        if(!reports) {
            throw new HttpException("No Records", HttpStatus.NOT_FOUND);
        }
        return reports;
    }

    async deleteReqFeature (id: number) {
        return this.prisma.requestFeature.delete({
            where: {feature_id: id}
        })
    }
}
