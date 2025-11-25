import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './services/posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth-guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { UserDocument } from '../users/schema/user.schema';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  async create(
    @CurrentUser() user: UserDocument,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(String(user._id), createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.postsService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findById(@Param('id') id: string, @CurrentUser() user?: UserDocument) {
    const userId = user ? String(user._id) : undefined;
    return this.postsService.findById(id, userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get posts by user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByUser(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.postsService.findByUser(userId, pageNum, limitNum);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  async likePost(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.postsService.likePost(id, String(user._id));
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  async unlikePost(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.postsService.unlikePost(id, String(user._id));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  async delete(@Param('id') id: string, @CurrentUser() user: UserDocument) {
    return this.postsService.delete(id, String(user._id));
  }
}
