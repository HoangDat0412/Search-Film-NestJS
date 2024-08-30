import { PrismaService } from '../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Country } from '@prisma/client';

@Injectable()
export class CountryService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; slug?: string }): Promise<Country> {
    return await this.prisma.country.create({
      data,
    });
  }

  async findAll(): Promise<Country[]> {
    return this.prisma.country.findMany();
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.prisma.country.findUnique({
      where: { country_id: id },
    });
    if (!country) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return country;
  }

  async update(
    id: number,
    data: { name?: string; slug?: string },
  ): Promise<Country> {
    const country = await this.prisma.country.update({
      where: { country_id: id },
      data,
    });
    if (!country) {
      throw new NotFoundException(`Country with id ${id} not found`);
    }
    return country;
  }

  async remove(id: number): Promise<void> {
    await this.prisma.country.delete({
      where: { country_id: id },
    });
  }

  async search(name: string): Promise<Country[]> {
    return this.prisma.country.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }
}
