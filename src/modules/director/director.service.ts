import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DirectorDto } from './dto/director.dto';
import { Director } from '@prisma/client';

@Injectable()
export class DirectorService {
    constructor( private prisma: PrismaService){}

    async addDirector(createDirectorDto: DirectorDto) {
        return await this.prisma.director.create({
            data: {
                name: createDirectorDto.name
            }
        })
    }

    async editDirector(director_id: number, editDirectorDto: DirectorDto) {
        const existDirector = await this.prisma.director.findFirst({
            where: {director_id}
        })

        if(!existDirector) {
            throw new HttpException("Director is not exist", HttpStatus.NOT_FOUND);
        }

        return await this.prisma.director.update({
            where: {director_id},
            data: {
                name: editDirectorDto.name
            }
        })
    }

    async getAllDirectors(
        skip: number ,
        take: number ,
      ): Promise<Director[]> {
        return this.prisma.director.findMany({
          skip,
          take,
        });
      }
}
