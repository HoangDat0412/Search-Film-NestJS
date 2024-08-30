import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestFeature } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class RequestFeatureService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    searchQuery: string = '',
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: RequestFeature[];
    total: number;
    total_pages: number;
    current_page: number;
  }> {
    // Tính số bản ghi cần phân trang
    const [data, total] = await Promise.all([
      this.prisma.requestFeature.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.requestFeature.count({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    // Tính số trang
    const total_pages = Math.ceil(total / limit);

    return {
      data,
      total,
      total_pages,
      current_page: page,
    };
  }

  async findOne(feature_id: number): Promise<RequestFeature> {
    return this.prisma.requestFeature.findUnique({ where: { feature_id } });
  }

  async create(data: {
    user_id: number;
    title: string;
    url_image: string;
    description: string;
  }): Promise<RequestFeature> {
    return this.prisma.requestFeature.create({ data });
  }

  async update(
    feature_id: number,
    data: {
      title?: string;
      url_image?: string;
      description?: string;
    },
  ): Promise<RequestFeature> {
    return this.prisma.requestFeature.update({ where: { feature_id }, data });
  }

  async remove(feature_id: number) {
    // Tìm bản ghi cần xóa

    const requestFeature = await this.findOne(feature_id);

    // // Xóa tệp hình ảnh nếu tồn tại
    if (requestFeature.url_image) {
      const filePath = path.join(process.cwd(), requestFeature.url_image);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        } else {
          console.warn('File not found:', filePath);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    // // Xóa bản ghi khỏi cơ sở dữ liệu
    return this.prisma.requestFeature.delete({
      where: { feature_id },
    });
  }
}
