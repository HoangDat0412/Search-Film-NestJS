import { Body, Controller, Delete, Param, Post, Put, UseFilters, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { AddCommentDto } from './dto/add-comment.dto';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


@Controller('comments')
@ApiTags('comment')
@UseFilters(AllExceptionsFilter)
export class CommentController {
    constructor (private readonly commentService: CommentService) {}

    @Put(':commentId')
    @UseGuards(AuthGuard)
    @ApiOperation({summary: "Edit User's comment"})
    async editComment (@Param('commentId') id: string, @Body() updateCommentDto: AddCommentDto) {
        const newComment = await this.commentService.updateComment(+id, updateCommentDto);
        return newComment;
    }

    @Delete(':commentId')
    @UseGuards(AuthGuard)
    @ApiOperation({summary: "Delete User's comment"})
    async deleteComment (@Param('commentId') id: string) {
        const comment = await this.commentService.deleteComment(+id);
        return comment;
    }
}
