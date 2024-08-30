import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatedActorDto } from './dtos/created-actor.dto';
import { GetActorDto } from './dtos/get-actor.dto';
import { Actor } from '@prisma/client';

@Injectable()
export class ActorService {
  constructor(private prisma: PrismaService) {}

  async createActor(data: CreatedActorDto) {
    const response = await this.prisma.actor.create({
      data: { name: data.name },
    });
    return response;
  }

  async getActor(query: GetActorDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) throw new Error('Page must be greater than 0');
    if (item_per_page < 1)
      throw new Error('Items per page must be greater than 0');

    // Tính tổng số bản ghi
    const [actors, totalActors] = await Promise.all([
      this.prisma.actor.findMany({
        skip: (page - 1) * item_per_page,
        take: item_per_page,
      }),
      this.prisma.actor.count(),
    ]);

    const totalPages = Math.ceil(totalActors / item_per_page);

    return {
      current_page: page,
      total_pages: totalPages,
      total_items: totalActors,
      items: actors,
    };
  }

  async updateActor(actor_id: number, data: CreatedActorDto) {
    return this.prisma.actor.update({
      where: { actor_id },
      data: data,
    });
  }

  async deleteActor(actor_id: number) {
    return this.prisma.actor.delete({ where: { actor_id } });
  }

  async search(query: GetActorDto, name: string) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) throw new Error('Page must be greater than 0');
    if (item_per_page < 1)
      throw new Error('Items per page must be greater than 0');

    // Tính tổng số bản ghi theo điều kiện tìm kiếm
    const [actors, totalActors] = await Promise.all([
      this.prisma.actor.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        skip: (page - 1) * item_per_page,
        take: item_per_page,
      }),
      this.prisma.actor.count({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalActors / item_per_page);

    return {
      current_page: page,
      total_pages: totalPages,
      total_items: totalActors,
      items: actors,
    };
  }
}
