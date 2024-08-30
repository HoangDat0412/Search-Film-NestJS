import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dtos/create-genre.dto';
import { GetGenreDto } from './dtos/get-genre.dto';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  async createGenre(data: CreateGenreDto) {
    const slug = data.name.replaceAll(' ', '-').toLowerCase();
    return this.prisma.genre.create({
      data: {
        name: data.name,
        slug: slug,
      },
    });
  }

  async getAllGenres(query: GetGenreDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) throw new Error('Page must be greater than 0');
    if (item_per_page < 1) throw new Error('Items per page must be greater than 0');

    // Tính tổng số bản ghi
    const [genres, totalGenres] = await Promise.all([
      this.prisma.genre.findMany({
        skip: (page - 1) * item_per_page,
        take: item_per_page,
      }),
      this.prisma.genre.count(),
    ]);

    const totalPages = Math.ceil(totalGenres / item_per_page);

    return {
      current_page: page,
      total_pages: totalPages,
      total_items: totalGenres,
      items: genres,
    };
  }

  async searchGenres(query: GetGenreDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;
    const search = query.search || '';

    // Validate page and item_per_page
    if (page < 1) throw new Error('Page must be greater than 0');
    if (item_per_page < 1) throw new Error('Items per page must be greater than 0');

    // Tính tổng số bản ghi theo điều kiện tìm kiếm
    const [genres, totalGenres] = await Promise.all([
      this.prisma.genre.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        skip: (page - 1) * item_per_page,
        take: item_per_page,
      }),
      this.prisma.genre.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalGenres / item_per_page);

    return {
      current_page: page,
      total_pages: totalPages,
      total_items: totalGenres,
      items: genres,
    };
  }


  async updateGenre(genre_id: number, data: CreateGenreDto) {
    const slug = data.name.replaceAll(' ', '-').toLowerCase();
    return this.prisma.genre.update({
      where: { genre_id },
      data: { name: data.name, slug: slug },
    });
  }

  async deleteGenre(genre_id: number) {
    return this.prisma.genre.delete({
      where: { genre_id },
    });
  }
}
