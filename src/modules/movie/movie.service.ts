import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEpisodeDto } from './dtos/create-episode.dto';
import { UpdateEpisodeDto } from './dtos/update-episode.dto';
import { CreateMovieDto } from './dtos/create-movie.dto';
import { GetMovieDto } from './dtos/get-movie.dto';
import { SearchMovieDto } from './dtos/search-movie.dto';

@Injectable()
export class MovieService {

  constructor(private prisma: PrismaService) {}

  async addMovieToPlaylist(movie_id: number, category_id: number) {
    return this.prisma.categoryMovie.create({
      data: {
        category: { connect: { category_id } },
        movie: { connect: { movie_id } },
      },
    });
  }

  async createMovie(movieData: CreateMovieDto, thumb_url: string) {
    const slug = movieData.name.replaceAll(' ', '-').toLowerCase();
    const response = await this.prisma.movie.create({
      data: {
        ...movieData,
        thumb_url: thumb_url,
        slug: slug,
        movie_genres: {
          create: movieData.movie_genres.map((id) => ({
            genre: {
              connect: {
                genre_id: id,
              },
            },
          })),
        },
        movie_countries: {
          create: movieData.movie_countries.map((id) => ({
            country: {
              connect: {
                country_id: id,
              },
            },
          })),
        },
        movie_actors: {
          create: movieData.movie_actors.map((id) => ({
            actor: {
              connect: {
                actor_id: id,
              },
            },
          })),
        },
        movie_directors: {
          create: movieData.movie_directors.map((id) => ({
            director: {
              connect: {
                director_id: id,
              },
            },
          })),
        },
        category_movies: {
          create: movieData.category_movies.map((id) => ({
            category: {
              connect: {
                category_id: id,
              },
            },
          })),
        },
      },
    });

    return response;
  }

  async getMovie(query: GetMovieDto) {
    let page = Number(query.page) || 1;
    let item_per_page = Number(query.item_per_page) || 10;

    const response = await this.prisma.movie.findMany({
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
      orderBy: { movie_id: 'desc' },
    });

    return response;
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

    return this.prisma.movie.findMany({
      distinct: ['slug'],
      skip: (page - 1) * item_per_page,
      take: item_per_page,
      where: {
        movie_genres: {
          every: {
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
    });
  }

  //filter film theo năm
  async filterByYear(year: number, query: GetMovieDto) {
    const page = Number(query.page) || 1;
    const item_per_page = Number(query.item_per_page) || 10;

    return this.prisma.movie.findMany({
      distinct: ['slug'],
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
    });
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
  async createEpisode(movie_id: number, data:CreateEpisodeDto) {
    const slug = data.name.replaceAll(" ", "-").toLowerCase()
    return this.prisma.episode.create({
      data: {...data, slug, movie_id}
    })
  }

  async updateEpisode(movie_id: number, episode_id: number, data:UpdateEpisodeDto) {
    const slug = data.name.replaceAll(" ", "-").toLowerCase()
    return this.prisma.episode.update({
      where: {episode_id},
      data: {...data, slug, movie_id}
    })
  }

  async getEpisode(movie_id: number) {
    return this.prisma.episode.findMany({
      where: {movie_id}
    })
  }

  async deleteEpisode (episode_id: number) {
    return this.prisma.episode.delete({
      where: {episode_id}
    })
  }

}
