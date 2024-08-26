import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdvertismentDto } from './dto/advertisement.dto';

@Injectable()
export class AdvertisementService {
    constructor( private prisma: PrismaService) {}

    async createAdvertisement (createAdvertismentDto: AdvertismentDto) {
        return this.prisma.advertisement.create({
            data: {
                title: createAdvertismentDto.title,
                content: createAdvertismentDto.content,
                image_url: createAdvertismentDto.image_url,
                target_url: createAdvertismentDto.target_url
            }
        })
    }

    async getAllAdvertisment () {
        return this.prisma.advertisement.findMany();
    }

    async getAdvertisementId (id: number) {
        const existedAd = await this.prisma.advertisement.findFirst({
            where: {ad_id: id}
        })
        if(!existedAd) {
            throw new HttpException("Advertisment is not exist", HttpStatus.NOT_FOUND);
        }

        return this.prisma.advertisement.findFirst({
            where: {ad_id: id}
        })
    }

    async updateAdvertisemnt (id: number, editAdvertisementDto: AdvertismentDto) {
        const existedAd = await this.prisma.advertisement.findFirst({
            where: {ad_id: id}
        })
        if(!existedAd) {
            throw new HttpException("Advertisment is not exist", HttpStatus.NOT_FOUND);
        }

        return this.prisma.advertisement.update({
            where: {ad_id: id},
            data: {
                title: editAdvertisementDto.title,
                content: editAdvertisementDto.content,
                image_url: editAdvertisementDto.image_url,
                target_url: editAdvertisementDto.target_url
            }
        })
    }

    async deleteAdvertisment (id: number) {
        const existedAd = await this.prisma.advertisement.findFirst({
            where: {ad_id: id}
        })
        if(!existedAd) {
            throw new HttpException("Advertisment is not exist", HttpStatus.NOT_FOUND);
        }

        return this.prisma.advertisement.delete({
            where: {ad_id: id}
        })
    }
}
