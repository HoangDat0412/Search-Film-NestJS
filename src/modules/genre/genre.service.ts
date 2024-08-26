import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { GetGenreDto } from './dtos/get-genre.dto';

@Injectable()
export class GenreService {
    constructor(private prisma: PrismaService) {}

    async createGenre(data:CreateGenreDto) {
        const slug = data.name.replaceAll(" ", "-").toLowerCase()
        return this.prisma.genre.create({
            data: {
                name: data.name,
                slug: slug
            }
        })
    }

    async getGenre(query: GetGenreDto) {
        const page = Number(query.page) || 1
        const item_per_page = Number(query.item_per_page) || 10
        const response = await this.prisma.genre.findMany({
            take: item_per_page,
            skip: (page - 1)*item_per_page
        })

        const count = await this.prisma.genre.count()

        return {
            data: response,
            count
        }
    }

    async updateGenre(genre_id: number, data: CreateGenreDto) {
        const slug = data.name.replaceAll(" ", "-").toLowerCase()
        return this.prisma.genre.update({
            where: {genre_id},
            data: {name: data.name, slug: slug}
        })
    }

    async deleteGenre(genre_id: number) {
        return this.prisma.genre.delete({
            where: {genre_id}
        })
    }
}