import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterUserDto } from './dtos/filter-user.dto';
import { UpdateUserByAdminDto } from './dtos/update-user-by-admin.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserService {

    constructor(private prismaService: PrismaService) {}

  async getUserDetail(id: number): Promise<any> {
    const response = await this.prismaService.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        is_2fa: true,
        created_at: true,
      },
    });
    return response;
  }

  async getMe(id: number): Promise<any> {
    const response = await this.prismaService.user.findUnique({
      where: { user_id: id },
      select: {
        user_id: true,
        username: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        facebook_id: true,
        google_id: true,
        is_2fa: true,
        is_verify: true,
        created_at: true,
        updated_at: true
      }
    });
    return response;
  }

  async uploadAvatar(req: any, avatarUrl: string) {
    const user = req.user_data
    return this.prismaService.user.update({
      where: {user_id: user.user_id},
      data: {avatar_url: avatarUrl}
    })
  }

  async getAll(query: FilterUserDto): Promise<any> {
    const page = Number(query.page) || 1;
    const item_in_page = Number(query.item_page) || 10;
    const search = query.search || '';

    const [user, count] = await this.prismaService.$transaction([

      this.prismaService.user.findMany({
        where: {
          role: {
            not: 'admin',
          },
          OR: [
            {
              email: {
                startsWith: `%${search}%`,
              },
            },
            {
              username: {
                startsWith: `%${search}%`,
              },
            },
          ],
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          full_name: true,
          avatar_url: true,
          role: true,
          google_id: true,
          facebook_id: true,
          is_2fa: true,
          created_at: true,
          updated_at: true
        },
        skip: (page - 1) * item_in_page,
        take: item_in_page,
        orderBy: {
          user_id: 'asc',
        },
      }),
      this.prismaService.user.count({
        where: {
          role: {
            not: 'admin',
          },
          OR: [
            {
              email: {
                startsWith: `%${search}%`,
              },
            },
            {
              username: {
                startsWith: `%${search}%`,
              },
            },
          ],
        },
      }),
    ]);

    return {
      user,
      count,
    };
  }

  async enable2fa(id: number): Promise<User> {
    return this.prismaService.user.update({
      where: {
        user_id: id
      },
      data: {
        is_2fa: true
      }
    })
  }

  async disable2fa(id: number): Promise<User> {
    return this.prismaService.user.update({
      where: {
        user_id: id
      },
      data: {
        is_2fa: false
      }
    })
  }


// Admin
  async updateUserByAdmin(id: number, data: UpdateUserByAdminDto):Promise<User> {
    const response = await this.prismaService.user.update({
      where: {user_id: id},
      data: data
    })

    return response
  }

  async deleteUserByAdmin(id: number):Promise<User> {
    const response = await this.prismaService.user.delete({
      where: {user_id: id}
    })

    return response
  }

  async getUserByAdmin(query: FilterUserDto): Promise<any> {
    const page = Number(query.page) || 1;
    const item_in_page = Number(query.item_page) || 10;
    const search = query.search || '';


    const [user, count] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where: {
          role: {
            not: 'admin',
          },
          OR: [
            {
              email: {
                startsWith: `%${search}%`,
              },
            },
            {
              username: {
                startsWith: `%${search}%`,
              },
            },
          ],
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          full_name: true,
          avatar_url: true,
          role: true,
          google_id: true,
          facebook_id: true,
          is_2fa: true,
          is_verify: true,
          created_at: true,
          updated_at: true
        },
        skip: (page - 1) * item_in_page,
        take: item_in_page,
        orderBy: {
          user_id: 'asc',
        },
      }),
      this.prismaService.user.count({
        where: {
          role: {
            not: 'admin',
          },
          OR: [
            {
              email: {
                startsWith: `%${search}%`,
              },
            },
            {
              username: {
                startsWith: `%${search}%`,
              },
            },
          ],
        },
      }),
    ]);

    return {
      user,
      count,
    };
  }
}