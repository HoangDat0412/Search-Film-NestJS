import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3, // Retry 3 times
  retryDelay: axiosRetry.exponentialDelay, // Exponential delay between retries
});

@Injectable()
export class CrawlFilmService {
  private readonly baseUrl = 'https://ophim1.com';

  constructor(private readonly prisma: PrismaService) {}

  async crawlFilms(slug: string): Promise<any[]> {
    console.log('slug', slug);

    const films = [];

    try {
      const filmDetails = await this.getFilmDetails(slug);
      await this.saveFilmToDatabase(filmDetails);
      films.push(filmDetails);
    } catch (error) {
      console.error(`Error processing film ${slug}:`, error);
    }

    return films;
  }

  // Fetch details of a specific film with proxy and retry logic
  private async getFilmDetails(slug: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/phim/${slug}`);
      console.log('response', response.data);

      return response.data;
    } catch (error) {
      console.error(`Error fetching film details for slug ${slug}:`, error);
      throw new Error('Failed to fetch film details');
    }
  }

  private async saveFilmToDatabase(filmDetails: any) {
    const {
      name,
      trailer_url,
      time,
      episode_current,
      episode_total,
      quality,
      lang,
      notify,
      showtimes,
      origin_name,
      content,
      type,
      status,
      thumb_url,
      poster_url,
      year,
      view,
      is_copyright,
      chieurap,
      sub_docquyen,
      actor,
      director,
      category,
      country,
      slug,
      tmdb,
    } = filmDetails.movie;
    const { episodes } = filmDetails;
    const des = content.replace(/<\/?p>/g, '');

    let movie;

    try {
      // Check if movie exists
      movie = await this.prisma.movie.findUnique({ where: { slug } });

      console.log('movie', movie);

      if (movie) {
        // Update if exists
        movie = await this.prisma.movie.update({
          where: { slug },
          data: {
            name,
            origin_name,
            content: des,
            type,
            status,
            thumb_url,
            poster_url,
            year: parseInt(year),
            view,
            is_copyright,
            chieurap,
            sub_docquyen,
            trailer_url,
            duration: time,
            episode_current,
            episode_total,
            quality,
            lang,
            notify,
            showtimes,
            tmdb_vote_count: parseInt(tmdb.vote_count),
            tmdb_vote_average: parseFloat(tmdb.vote_average),
          },
        });
      } else {
        // Create new movie
        movie = await this.prisma.movie.create({
          data: {
            name,
            origin_name,
            content: des,
            type,
            status,
            thumb_url,
            poster_url,
            year: parseInt(year),
            view,
            is_copyright,
            chieurap,
            sub_docquyen,
            slug,
            trailer_url,
            duration: time,
            episode_current,
            episode_total,
            quality,
            lang,
            notify,
            showtimes,
            tmdb_vote_count: parseInt(tmdb.vote_count),
            tmdb_vote_average: parseFloat(tmdb.vote_average),
          },
        });

      }

      // Save relationships: actors, directors, genres, countries, episodes
      await this.saveActors(movie.movie_id, actor);
      await this.saveDirectors(movie.movie_id, director);
      await this.saveGenres(movie.movie_id, category);
      await this.saveCountries(movie.movie_id, country);
      await this.saveEpisodes(
        movie.movie_id,
        episodes[0].server_data,
        episodes[0].server_name,
      );
    } catch (error) {
      console.error(`Error saving movie ${name}:`, error);
    }
  }

  private async saveActors(movieId: number, actors: string[]) {
    await Promise.all(
      actors.map(async (actorName) => {
        try {
          let actor = await this.prisma.actor.findFirst({
            where: { name: actorName },
          });
          if (!actor) {
            actor = await this.prisma.actor.create({
              data: { name: actorName },
            });
          }
          await this.prisma.movieActor.upsert({
            where: {
              movie_id_actor_id: {
                movie_id: movieId,
                actor_id: actor.actor_id,
              },
            },
            update: {},
            create: { movie_id: movieId, actor_id: actor.actor_id },
          });
        } catch (error) {
          console.error(`Error saving actor ${actorName}:`, error);
        }
      }),
    );
  }

  private async saveDirectors(movieId: number, directors: string[]) {
    await Promise.all(
      directors.map(async (directorName) => {
        try {
          let director = await this.prisma.director.findFirst({
            where: { name: directorName },
          });
          if (!director) {
            director = await this.prisma.director.create({
              data: { name: directorName },
            });
          }
          await this.prisma.movieDirector.upsert({
            where: {
              movie_id_director_id: {
                movie_id: movieId,
                director_id: director.director_id,
              },
            },
            update: {},
            create: { movie_id: movieId, director_id: director.director_id },
          });
        } catch (error) {
          console.error(`Error saving director ${directorName}:`, error);
        }
      }),
    );
  }

  private async saveGenres(movieId: number, categories: any[]) {
    await Promise.all(
      categories.map(async (genre) => {
        try {
          let genreEntry = await this.prisma.genre.findUnique({
            where: { name: genre.name },
          });
          if (!genreEntry) {
            genreEntry = await this.prisma.genre.create({
              data: { name: genre.name, slug: genre.slug },
            });
          }
          await this.prisma.movieGenre.upsert({
            where: {
              movie_id_genre_id: {
                movie_id: movieId,
                genre_id: genreEntry.genre_id,
              },
            },
            update: {},
            create: { movie_id: movieId, genre_id: genreEntry.genre_id },
          });
        } catch (error) {
          console.error(`Error saving genre ${genre.name}:`, error);
        }
      }),
    );
  }

  private async saveCountries(movieId: number, countries: any[]) {
    await Promise.all(
      countries.map(async (countryEntry) => {
        try {
          let country = await this.prisma.country.findUnique({
            where: { name: countryEntry.name },
          });
          if (!country) {
            country = await this.prisma.country.create({
              data: { name: countryEntry.name, slug: countryEntry.slug },
            });
          }
          await this.prisma.movieCountry.upsert({
            where: {
              movie_id_country_id: {
                movie_id: movieId,
                country_id: country.country_id,
              },
            },
            update: {},
            create: { movie_id: movieId, country_id: country.country_id },
          });
        } catch (error) {
          console.error(`Error saving country ${countryEntry.name}:`, error);
        }
      }),
    );
  }

  private async saveEpisodes(
    movieId: number,
    episodes: any[],
    serverName: string,
  ) {
    await Promise.all(
      episodes.map(async (episode) => {
        try {
          // Tìm episode dựa trên movieId và slug
          const existingEpisode = await this.prisma.episode.findFirst({
            where: {
              movie_id: movieId,
              slug: episode.slug,
            },
          });
          console.log('existing episode', existingEpisode);

          if (existingEpisode) {
            // Nếu episode đã tồn tại, thực hiện cập nhật
            await this.prisma.episode.update({
              where: { episode_id: existingEpisode.episode_id },
              data: {
                server_name: serverName,
                name: episode.name,
                filename: episode.filename,
                link_film: episode.link_embed,
              },
            });
          } else {
            // Nếu episode chưa tồn tại, thực hiện tạo mới
            await this.prisma.episode.create({
              data: {
                movie_id: movieId,
                server_name: serverName,
                name: episode.name,
                slug: episode.slug,
                filename: episode.filename,
                link_film: episode.link_embed,
              },
            });
          }
        } catch (error) {
          console.error(`Error saving episode ${episode.name}:`, error);
        }
      }),
    );
  }
}
