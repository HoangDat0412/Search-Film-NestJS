import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddCommentDto } from './dto/add-comment.dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async addComment(
    movieId: number,
    userId: number,
    createCommentDto: AddCommentDto,
  ) {
    if (!createCommentDto.content) {
      throw new Error('Comment Is Blank');
    }
    return this.prisma.comment.create({
      data: {
        content: createCommentDto.content,
        movie: {
          connect: { movie_id: movieId },
        },
        user: {
          connect: { user_id: userId },
        },
      },
    });
  }

  async fetchAllMovieComment(movieId: number) {
    const existedMovie = await this.prisma.movie.findFirst({
      where: { movie_id: movieId },
    });
    if (!existedMovie) {
      throw new HttpException('Movie Is Not Exist', HttpStatus.NOT_FOUND);
    }
    return this.prisma.comment.findMany({
      where: { movie_id: movieId },
    });
  }

  async updateComment(id: number, updateCommentDto: AddCommentDto) {
    return this.prisma.comment.update({
      where: { comment_id: id },
      data: {
        content: updateCommentDto.content,
      },
    });
  }

  async deleteComment(id: number) {
    return this.prisma.comment.delete({
      where: { comment_id: id },
    });
  }
}
