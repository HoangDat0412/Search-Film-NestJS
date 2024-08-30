import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DirectorDto } from './dto/director.dto';
import { Director } from '@prisma/client';
import { GetDirectorsDto } from './dto/get-directors.dto';

@Injectable()
export class DirectorService {
  constructor(private prisma: PrismaService) {}

  async addDirector(createDirectorDto: DirectorDto) {
    return await this.prisma.director.create({
      data: {
        name: createDirectorDto.name,
      },
    });
  }

  async editDirector(director_id: number, editDirectorDto: DirectorDto) {
    const existDirector = await this.prisma.director.findFirst({
      where: { director_id },
    });

    if (!existDirector) {
      throw new HttpException('Director is not exist', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.director.update({
      where: { director_id },
      data: {
        name: editDirectorDto.name,
      },
    });
  }

  async getAllDirectors(query: GetDirectorsDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) throw new Error('Page must be greater than 0');
    if (item_per_page < 1)
      throw new Error('Items per page must be greater than 0');

    // Tính tổng số bản ghi
    const [directors, totalDirectors] = await Promise.all([
      this.prisma.director.findMany({
        skip: (page - 1) * item_per_page,
        take: item_per_page,
      }),
      this.prisma.director.count(),
    ]);

    const totalPages = Math.ceil(totalDirectors / item_per_page);

    return {
      current_page: page,
      total_pages: totalPages,
      total_items: totalDirectors,
      items: directors,
    };
  }

  async searchDirectors(query: GetDirectorsDto, name: string) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) throw new Error('Page must be greater than 0');
    if (item_per_page < 1)
      throw new Error('Items per page must be greater than 0');

    // Tính tổng số bản ghi theo điều kiện tìm kiếm
    const [directors, totalDirectors] = await Promise.all([
      this.prisma.director.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: (page - 1) * item_per_page,
        take: item_per_page,
      }),
      this.prisma.director.count({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalDirectors / item_per_page);

    return {
      current_page: page,
      total_pages: totalPages,
      total_items: totalDirectors,
      items: directors,
    };
  }
  async deleteDirector(id: number): Promise<void> {
    const director = await this.prisma.director.findUnique({
      where: { director_id: id },
    });
    if (!director) {
      throw new NotFoundException(`Director with id ${id} not found`);
    }
    await this.prisma.director.delete({
      where: { director_id: id },
    });
  }
}
