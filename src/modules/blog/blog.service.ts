import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.blog.create({
      data,
    });
  }

  async findAll(page: number, limit: number, searchTerm?: string) {
    const blogs = await this.prisma.blog.findMany({
      where: {
        is_verify: true,
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.blog.count({
      where: {
        OR: [
          {
            is_verify: true,
          },
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      data: blogs,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  //findAllBlog
  async findAllBlog(page: number, limit: number, searchTerm?: string) {
    const blogs = await this.prisma.blog.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });

    const totalCount = await this.prisma.blog.count({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
    });

    return {
      data: blogs,
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.blog.findUnique({
      where: { blog_id: id },
      include: {
        user: {
          select: {
            username: true,
            avatar_url: true,
          },
        },
      },
    });
  }

  async update(
    id: number,
    data: Prisma.BlogUpdateInput,
    userId: number,
    isAdmin: boolean,
  ) {
    const blog = await this.findOne(id);
    if (blog.user_id !== userId && !isAdmin) {
      throw new Error('You do not have permission to update this blog.');
    }
    if (data.image_url && blog.image_url !== data.image_url) {
      this.deleteImage(blog.image_url); // Delete old image if new image is uploaded
    }
    return this.prisma.blog.update({
      where: { blog_id: id },
      data,
    });
  }

  async remove(id: number, userId: number, isAdmin: boolean) {
    const blog = await this.findOne(id);
    if (blog.user_id !== userId && !isAdmin) {
      throw new Error('You do not have permission to delete this blog.');
    }
    this.deleteImage(blog.image_url); // Delete the associated image
    return this.prisma.blog.delete({
      where: { blog_id: id },
    });
  }

  async search(term: string) {
    return this.prisma.blog.findMany({
      where: {
        OR: [{ title: { contains: term } }, { content: { contains: term } }],
      },
    });
  }

  async verifyBlog(id: number, isAdmin: boolean) {
    if (!isAdmin) {
      throw new Error('Only admins can verify blogs.');
    }
    return this.prisma.blog.update({
      where: { blog_id: id },
      data: { is_verify: true },
    });
  }

  private deleteImage(imageUrl: string) {
    if (imageUrl) {
      const filePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      } else {
        console.warn('File not found:', filePath);
      }
    }
  }

  async getTopBloggers(limit: number) {
    // Group by user_id in Blog, count the number of blogs for each user
    const topBloggers = await this.prisma.blog.groupBy({
      by: ['user_id'],
      _count: {
        blog_id: true, // Count the number of blogs for each user
      },
      orderBy: {
        _count: {
          blog_id: 'desc', // Order by the number of blogs in descending order
        },
      },
      take: limit, // Limit the number of results
    });

    // Get user details for the top bloggers
    const userIds = topBloggers.map((blogger) => blogger.user_id);
    const users = await this.prisma.user.findMany({
      where: {
        user_id: { in: userIds },
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        avatar_url: true,
      },
    });

    // Combine user details with the blog count
    const result = users.map((user) => {
      const blogCount =
        topBloggers.find((blogger) => blogger.user_id === user.user_id)?._count
          ?.blog_id || 0;
      return {
        ...user,
        blogCount,
      };
    });

    return result;
  }
}
