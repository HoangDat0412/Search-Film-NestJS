import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportBug } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class ReportBugService {
  constructor(private prisma: PrismaService) {}

  async create(createReportBugDto: any) {
    return this.prisma.reportBug.create({
      data: {
        ...createReportBugDto,
      },
    });
  }

  async findAll(
    searchQuery: string = '',
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: ReportBug[];
    total: number;
    total_pages: number;
    current_page: number;
  }> {
    // Tính số bản ghi cần phân trang
    const [data, total] = await Promise.all([
      this.prisma.reportBug.findMany({
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
  async findAllUser(
    searchQuery: string = '',
    page: number = 1,
    limit: number = 10,
    userid: number,
  ): Promise<{
    data: ReportBug[];
    total: number;
    total_pages: number;
    current_page: number;
  }> {
    // Tính số bản ghi cần phân trang
    const [data, total] = await Promise.all([
      this.prisma.reportBug.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
          user_id: userid,
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
          user_id: userid,
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

  async findOne(bug_id: number) {
    return this.prisma.reportBug.findUnique({
      where: { bug_id },
    });
  }

  async remove(bug_id: number) {
    const reportBug = await this.findOne(bug_id);

    // // Xóa tệp hình ảnh nếu tồn tại
    if (reportBug.url_image) {
      const filePath = path.join(process.cwd(), reportBug.url_image);
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
    return this.prisma.reportBug.delete({
      where: { bug_id },
    });
  }
}
