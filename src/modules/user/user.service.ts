import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { FilterUserDto } from './dtos/filter-user.dto';
import { UpdateUserByAdminDto } from './dtos/update-user-by-admin.dto';
import { User } from '@prisma/client';
import { UpdateUsernameDto } from './dtos/update-username.dto';
import { UpdateEmailDto } from './dtos/update-email.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { StatisticsDto } from './dtos/statistics.dto';

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
        avatar_url: true,
        role: true,
        bio: true,
        facebook_id: true,
        google_id: true,
        is_2fa: true,
        is_verify: true,
        created_at: true,
        updated_at: true,
      },
    });
    return response;
  }

  async uploadAvatar(req: any, avatarUrl: string) {
    const user = req.user_data;
    return this.prismaService.user.update({
      where: { user_id: user.user_id },
      data: { avatar_url: avatarUrl },
    });
  }

  async getAll(query: FilterUserDto): Promise<any> {
    const page = Number(query.page) || 1;
    const item_in_page = Number(query.item_page) || 10;
    const search = query.search || '';

    // Validate page and item_in_page
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (item_in_page < 1) {
      throw new BadRequestException('Items per page must be greater than 0');
    }

    const [users, count] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where: {
          role: {
            not: 'admin',
          },
          OR: [
            {
              email: {
                contains: search, // or 'startsWith' if you want to search at the beginning
              },
            },
            {
              username: {
                contains: search, // or 'startsWith'
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
          updated_at: true,
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
                contains: search, // or 'startsWith'
              },
            },
            {
              username: {
                contains: search, // or 'startsWith'
              },
            },
          ],
        },
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(count / item_in_page);

    return {
      users,
      count,
      totalPages,
      currentPage: page,
    };
  }

  async enable2fa(id: number): Promise<User> {
    return this.prismaService.user.update({
      where: {
        user_id: id,
      },
      data: {
        is_2fa: true,
      },
    });
  }

  async disable2fa(id: number): Promise<User> {
    return this.prismaService.user.update({
      where: {
        user_id: id,
      },
      data: {
        is_2fa: false,
      },
    });
  }

  async updateUsername(userId: number, dto: UpdateUsernameDto) {
    return await this.prismaService.user.update({
      where: { user_id: userId },
      data: { username: dto.username },
      select: {
        username: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        updated_at: true,
        bio: true
      },
    });
  }
  async updateBio(userId: number, dto: any) {
    return await this.prismaService.user.update({
      where: { user_id: userId },
      data: { bio: dto.bio },
      select: {
        username: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        updated_at: true,
        bio: true
      },
    });
  }
  async updateEmail(userId: number, dto: UpdateEmailDto) {
    return await this.prismaService.user.update({
      where: { user_id: userId },
      data: { email: dto.email },
      select: {
        username: true,
        email: true,
        full_name: true,
        avatar_url: true,
        role: true,
        updated_at: true,
        bio: true
      },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
      await this.prismaService.user.update({
        where: { user_id: userId },
        data: { password: hashedPassword },
      });
      return 'Update password success';
    } catch (error) {
      throw new Error('Error updating password');
    }
  }

  // Admin
  async updateUserByAdmin(
    id: number,
    data: UpdateUserByAdminDto,
  ): Promise<User> {
    const response = await this.prismaService.user.update({
      where: { user_id: id },
      data: data,
    });

    return response;
  }

  async deleteUserByAdmin(id: number): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { user_id: id },
    });
    if (user) {
      const response = await this.prismaService.user.delete({
        where: { user_id: id },
      });

      return response;
    } else {
      throw new NotFoundException('User not found');
    }
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
          updated_at: true,
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

  async getStatistics(): Promise<StatisticsDto> {
    const [totalFilms, filmsThisWeek] = await Promise.all([
      this.prismaService.movie.count(),
      this.prismaService.movie.count({
        where: {
          created_at: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      }),
    ]);

    const [totalActivatedUsers, usersThisWeek] = await Promise.all([
      this.prismaService.user.count({ where: { is_verify: true } }),
      this.prismaService.user.count({
        where: {
          is_verify: true,
          created_at: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    ]);

    const [totalRates, ratesThisWeek] = await Promise.all([
      this.prismaService.rating.count(),
      this.prismaService.rating.count({
        where: {
          created_at: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    ]);

    const [totalReportBugs, bugsThisWeek] = await Promise.all([
      this.prismaService.reportBug.count(),
      this.prismaService.reportBug.count({
        where: {
          created_at: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    ]);

    const [totalBlogs, blogsThisWeek] = await Promise.all([
      this.prismaService.blog.count(),
      this.prismaService.blog.count({
        where: {
          created_at: {
            gte: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      })
    ]);

    const [totalActors, actorsThisWeek] = await Promise.all([
      this.prismaService.actor.count(),
      this.prismaService.actor.count({
        where: {
          movie_actors: {
            some: {
              movie: {
                created_at: {
                  gte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
              }
            }
          }
        }
      })
    ]);

    const [totalFilmTypes, filmTypesThisWeek] = await Promise.all([
      this.prismaService.movieGenre.count(),
      this.prismaService.movieGenre.count({
        where: {
          movie: {
            created_at: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          }
        }
      })
    ]);

    const [totalCountries, countriesThisWeek] = await Promise.all([
      this.prismaService.movieCountry.count(),
      this.prismaService.movieCountry.count({
        where: {
          movie: {
            created_at: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          }
        }
      })
    ]);

    return {
      totalFilms,
      filmsThisWeek,
      totalActivatedUsers,
      usersThisWeek,
      totalRates,
      ratesThisWeek,
      totalReportBugs,
      bugsThisWeek,
      totalBlogs,
      blogsThisWeek,
      totalActors,
      actorsThisWeek,
      totalFilmTypes,
      filmTypesThisWeek,
      totalCountries,
      countriesThisWeek
    };
  }
}
