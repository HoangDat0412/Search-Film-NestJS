import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEpisodeDto } from './dtos/create-episode.dto';
import { UpdateEpisodeDto } from './dtos/update-episode.dto';
import { CreateMovieDto } from './dtos/create-movie.dto';
import { GetMovieDto } from './dtos/get-movie.dto';
import { SearchMovieDto } from './dtos/search-movie.dto';
import { Country, Genre } from '@prisma/client';
import { SearchFilmDto } from './dtos/search-film.dto';
import { UpdateMovieDto } from './dtos/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  async getTopMoviesOfMonth(limit: number = 20) {
    // Calculate the start and end of the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the month

    return this.prisma.movie.findMany({
      where: {
        created_at: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: {
        view: 'desc', // Order by view in descending order
      },
      take: limit, // Limit the number of results
      select: {
        movie_id: true,
        name: true,
        view: true,
        thumb_url: true,
        poster_url: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async addMovieToPlaylist(movie_id: number, category_id: number) {
    return this.prisma.categoryMovie.create({
      data: {
        category: { connect: { category_id } },
        movie: { connect: { movie_id } },
      },
    });
  }

  async createMovie(movieData: CreateMovieDto) {
    const slug = movieData.name.replaceAll(' ', '-').toLowerCase();

    const response = await this.prisma.movie.create({
      data: {
        ...movieData,
        slug: slug,
        movie_genres: movieData.movie_genres?.length
          ? {
              create: movieData.movie_genres.map((id) => ({
                genre: {
                  connect: {
                    genre_id: id,
                  },
                },
              })),
            }
          : undefined,
        movie_countries: movieData.movie_countries?.length
          ? {
              create: movieData.movie_countries.map((id) => ({
                country: {
                  connect: {
                    country_id: id,
                  },
                },
              })),
            }
          : undefined,
        movie_actors: movieData.movie_actors?.length
          ? {
              create: movieData.movie_actors.map((id) => ({
                actor: {
                  connect: {
                    actor_id: id,
                  },
                },
              })),
            }
          : undefined,
        movie_directors: movieData.movie_directors?.length
          ? {
              create: movieData.movie_directors.map((id) => ({
                director: {
                  connect: {
                    director_id: id,
                  },
                },
              })),
            }
          : undefined,
      },
    });

    return response;
  }

  async updateMovie(updateMovieDto: UpdateMovieDto, id: number) {
    // Kiểm tra xem bộ phim có tồn tại không
    const movie = await this.prisma.movie.findUnique({
      where: { movie_id: id },
      include: {
        movie_genres: true,
        movie_countries: true,
        movie_actors: true,
        movie_directors: true,
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    const dataToUpdate: any = { ...updateMovieDto };

    if (updateMovieDto.movie_genres !== undefined) {
      dataToUpdate.movie_genres = {
        deleteMany: movie.movie_genres.map((item) => ({
          genre_id: item.genre_id,
        })),
        create: updateMovieDto.movie_genres.map((id) => ({
          genre: {
            connect: {
              genre_id: id,
            },
          },
        })),
      };
    }

    if (updateMovieDto.movie_countries !== undefined) {
      dataToUpdate.movie_countries = {
        deleteMany: movie.movie_countries.map((item) => ({
          country_id: item.country_id,
        })),
        create: updateMovieDto.movie_countries.map((id) => ({
          country: {
            connect: {
              country_id: id,
            },
          },
        })),
      };
    }

    if (updateMovieDto.movie_actors !== undefined) {
      dataToUpdate.movie_actors = {
        deleteMany: movie.movie_actors.map((item) => ({
          actor_id: item.actor_id,
        })),
        create: updateMovieDto.movie_actors.map((id) => ({
          actor: {
            connect: {
              actor_id: id,
            },
          },
        })),
      };
    }

    if (updateMovieDto.movie_directors !== undefined) {
      dataToUpdate.movie_directors = {
        deleteMany: movie.movie_directors.map((item) => ({
          director_id: item.director_id,
        })),
        create: updateMovieDto.movie_directors.map((id) => ({
          director: {
            connect: {
              director_id: id,
            },
          },
        })),
      };
    }

    // Cập nhật bộ phim
    return this.prisma.movie.update({
      where: { movie_id: id },
      data: dataToUpdate,
    });
  }

  async deleteMovie(id: number) {
    // Kiểm tra xem bộ phim có tồn tại không
    const movie = await this.prisma.movie.findUnique({
      where: { movie_id: id },
      include: {
        movie_genres: true,
        movie_countries: true,
        movie_actors: true,
        movie_directors: true,
        episodes: true, // Nếu có
        ratings: true, // Nếu có
        comments: true, // Nếu có
      },
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    // Xóa bộ phim và tất cả các mối quan hệ liên quan
    await this.prisma.$transaction([
      this.prisma.movieGenre.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.movieCountry.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.movieActor.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.movieDirector.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.episode.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.rating.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.comment.deleteMany({
        where: { movie_id: id },
      }),
      this.prisma.movie.delete({
        where: { movie_id: id },
      }),
    ]);

    return {
      message: `Movie with ID ${id} deleted successfully`,
    };
  }

  async getMovie(query: GetMovieDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 24;

    // Validate page and item_per_page
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (item_per_page < 1) {
      throw new BadRequestException('Items per page must be greater than 0');
    }

    // Fetch movies with pagination
    const [movies, totalMovies] = await Promise.all([
      this.prisma.movie.findMany({
        select: {
          movie_id: true,
          name: true,
          origin_name: true,
          type: true,
          status: true,
          thumb_url: true,
          duration: true,
          episode_total: true,
          content: true,
          slug: true,
          year: true,
          view: true,
          poster_url: true,
        },
        skip: (page - 1) * item_per_page,
        take: item_per_page,
        orderBy: { movie_id: 'desc' },
      }),
      this.prisma.movie.count(),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalMovies / item_per_page);

    return {
      movies,
      totalMovies,
      totalPages,
      currentPage: page,
    };
  }

  //lấy chi tiết film theo id
  async getById(id: number) {
    const response = await this.prisma.movie.findFirst({
      where: { movie_id: id },
      select: {
        movie_id: true,
        name: true,
        origin_name: true,
        type: true,
        status: true,
        thumb_url: true,
        duration: true,
        episode_total: true,
        content: true,
        slug: true,
        year: true,
        view: true,
        poster_url: true,
        ratings: true,
        showtimes: true,
        lang: true,
        notify: true,
        quality: true,
        trailer_url: true,
        episode_current: true,
        chieurap: true,
        movie_genres: {
          select: {
            genre: true,
          },
        },
        movie_actors: {
          select: {
            actor: true,
          },
        },
        movie_countries: {
          select: {
            country: true,
          },
        },
        movie_directors: {
          select: {
            director: true,
          },
        },
        category_movies: {
          select: {
            category: true,
          },
        },
        episodes: {
          select: {
            link_film: true,
            server_name: true,
          },
        },
      },
    });

    return response;
  }

  //filter film theo thể loại
  async filterByGenre(genre: string, query: GetMovieDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (item_per_page < 1) {
      throw new BadRequestException('Items per page must be greater than 0');
    }

    // Fetch movies with pagination and filter by genre
    const movies = await this.prisma.movie.findMany({
      skip: (page - 1) * item_per_page,
      take: item_per_page,
      where: {
        movie_genres: {
          some: {
            genre: { slug: genre },
          },
        },
      },
      include: {
        movie_genres: {
          select: {
            genre: true,
          },
        },
        movie_actors: {
          select: {
            actor: true,
          },
        },
        movie_countries: {
          select: {
            country: true,
          },
        },
        movie_directors: {
          select: {
            director: true,
          },
        },
        category_movies: {
          select: {
            category: true,
          },
        },
      },
      orderBy: {
        movie_id: 'desc',
      },
    });

    // Count the total number of movies matching the filter
    const totalMovies = await this.prisma.movie.count({
      where: {
        movie_genres: {
          some: {
            genre: { slug: genre },
          },
        },
      },
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalMovies / item_per_page);

    return {
      movies,
      totalMovies,
      totalPages,
      currentPage: page,
    };
  }

  async filterByCountry(
    countrySlug: string,
    query: SearchFilmDto,
  ): Promise<any> {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (item_per_page < 1) {
      throw new BadRequestException('Items per page must be greater than 0');
    }

    const [movies, totalMovies] = await Promise.all([
      this.prisma.movie.findMany({
        skip: (page - 1) * item_per_page,
        take: item_per_page,
        where: {
          movie_countries: {
            some: {
              country: { slug: countrySlug },
            },
          },
        },
        include: {
          movie_genres: { select: { genre: true } },
          movie_actors: { select: { actor: true } },
          movie_countries: { select: { country: true } },
          movie_directors: { select: { director: true } },
          category_movies: { select: { category: true } },
        },
        orderBy: { movie_id: 'desc' },
      }),
      this.prisma.movie.count({
        where: {
          movie_countries: {
            some: {
              country: { slug: countrySlug },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalMovies / item_per_page);

    return { movies, totalMovies, totalPages, currentPage: page };
  }

  //filter film theo năm
  async filterByYear(year: number, query: GetMovieDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    // Validate page and item_per_page
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (item_per_page < 1) {
      throw new BadRequestException('Items per page must be greater than 0');
    }

    // Fetch movies with pagination and filter by year
    const [movies, totalMovies] = await Promise.all([
      this.prisma.movie.findMany({
        where: { year: year },
        skip: (page - 1) * item_per_page,
        take: item_per_page,
        include: {
          movie_genres: {
            select: {
              genre: true,
            },
          },
          movie_actors: {
            select: {
              actor: true,
            },
          },
          movie_countries: {
            select: {
              country: true,
            },
          },
          movie_directors: {
            select: {
              director: true,
            },
          },
          category_movies: {
            select: {
              category: true,
            },
          },
        },
        orderBy: {
          movie_id: 'desc',
        },
      }),
      this.prisma.movie.count({
        where: { year: year },
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalMovies / item_per_page);

    return {
      movies,
      totalMovies,
      totalPages,
      currentPage: page,
    };
  }

  async getCountries(): Promise<Country[]> {
    return this.prisma.country.findMany({
      select: {
        country_id: true,
        name: true,
        slug: true,
      },
    });
  }

  async getYears(): Promise<number[]> {
    const movies = await this.prisma.movie.findMany({
      select: {
        year: true,
      },
      distinct: ['year'], // Ensure unique years
      orderBy: {
        year: 'desc', // Sort years in descending order
      },
    });
    return movies.map((movie) => movie.year).filter((year) => year != null); // Ensure no null years
  }

  async getGenres(): Promise<Genre[]> {
    return this.prisma.genre.findMany({
      select: {
        genre_id: true,
        name: true,
        slug: true,
      },
    });
  }

  async searchFilms(query: SearchFilmDto): Promise<any> {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;
    const searchTerm = query.search || '';
    const type = query.type || '';
    // Validate page and item_per_page
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }
    if (item_per_page < 1) {
      throw new BadRequestException('Items per page must be greater than 0');
    }

    // Fetch filtered movies
    const [movies, totalMovies] = await Promise.all([
      this.prisma.movie.findMany({
        skip: (page - 1) * item_per_page,
        take: item_per_page,
        where: {
          OR: [
            {
              name: { contains: searchTerm, mode: 'insensitive' },
            },
            {
              origin_name: { contains: searchTerm, mode: 'insensitive' },
            },
            {
              type: { contains: type, mode: 'insensitive' },
            },
            {
              movie_genres: {
                some: {
                  genre: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              movie_directors: {
                some: {
                  director: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              movie_actors: {
                some: {
                  actor: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              movie_countries: {
                some: {
                  country: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        },
        orderBy: {
          movie_id: 'desc',
        },
      }),
      this.prisma.movie.count({
        where: {
          OR: [
            {
              name: { contains: searchTerm, mode: 'insensitive' },
            },
            {
              origin_name: { contains: searchTerm, mode: 'insensitive' },
            },
            {
              movie_genres: {
                some: {
                  genre: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              movie_directors: {
                some: {
                  director: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              movie_actors: {
                some: {
                  actor: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
            {
              movie_countries: {
                some: {
                  country: {
                    name: { contains: searchTerm, mode: 'insensitive' },
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalMovies / item_per_page);

    return {
      movies,
      totalMovies,
      totalPages,
      currentPage: page,
    };
  }

  //fillter film nhiều lượt xem nhất
  async filterByRecommended(query: GetMovieDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;
    return this.prisma.movie.findMany({
      distinct: ['slug'],
      orderBy: { view: 'desc' },
      skip: (page - 1) * item_per_page,
      take: item_per_page,
      include: {
        movie_genres: {
          select: {
            genre: true,
          },
        },
        movie_actors: {
          select: {
            actor: true,
          },
        },
        movie_countries: {
          select: {
            country: true,
          },
        },
        movie_directors: {
          select: {
            director: true,
          },
        },
        category_movies: {
          select: {
            category: true,
          },
        },
      },
    });
  }

  //search film theo tên hoặc diễn viên
  async getBySearch(query: SearchMovieDto) {
    let search = query.search || '';
    let page = Number(query.page) || 1;
    let item_per_page = Number(query.item_per_page) || 10;

    const response = await this.prisma.movie.findMany({
      where: {
        OR: [
          {
            name: {
              startsWith: `%${search}%`,
            },
            movie_actors: {
              every: {
                actor: {
                  name: {
                    startsWith: `%${search}%`,
                  },
                },
              },
            },
          },
        ],
      },
      distinct: ['slug'],
      select: {
        movie_id: true,
        name: true,
        origin_name: true,
        type: true,
        status: true,
        thumb_url: true,
        duration: true,
        episode_total: true,
        content: true,
        slug: true,
        year: true,
        view: true,
        poster_url: true,
        movie_genres: {
          select: {
            genre: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        movie_actors: {
          select: {
            actor: {
              select: {
                actor_id: true,
                name: true,
              },
            },
          },
        },
        movie_countries: {
          select: {
            country: {
              select: {
                country_id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        movie_directors: {
          select: {
            director: {
              select: {
                director_id: true,
                name: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * item_per_page,
      take: item_per_page,
      orderBy: { movie_id: 'asc' },
    });

    return response;
  }
  //----------------------------------------
  //EPISODE

  // create
  async createEpisode(movie_id: number, data: CreateEpisodeDto) {
    const slug = data.name.replaceAll(' ', '-').toLowerCase();
    return this.prisma.episode.create({
      data: { ...data, slug, movie_id },
    });
  }

  async updateEpisode(
    movie_id: number,
    episode_id: number,
    data: UpdateEpisodeDto,
  ) {
    const slug = data.name.replaceAll(' ', '-').toLowerCase();
    return this.prisma.episode.update({
      where: { episode_id },
      data: { ...data, slug, movie_id },
    });
  }

  async getEpisode(movie_id: number) {
    return this.prisma.episode.findMany({
      where: { movie_id },
    });
  }

  async deleteEpisode(episode_id: number) {
    return this.prisma.episode.delete({
      where: { episode_id },
    });
  }
}
