import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PostDocument } from '../posts/schema/post.schema';
import { UserDocument } from '../users/schema/user.schema';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

interface JwtPayload {
  sub: string;
  username: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/',
})
@Injectable()
export class WebSocketGatewayService
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    try {
      const authToken: unknown = client.handshake.auth?.token;
      const queryToken: unknown = client.handshake.query?.token;
      const token =
        (typeof authToken === 'string' ? authToken : undefined) ||
        (typeof queryToken === 'string' ? queryToken : undefined);

      if (!token) {
        console.log('Client connected without token, disconnecting');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') || 'your-secret-key',
      });

      client.userId = payload.sub;
      client.username = payload.username;

      if (!client.userId) {
        console.log('Client connected without userId, disconnecting');
        client.disconnect();
        return;
      }

      if (!this.userSockets.has(client.userId)) {
        this.userSockets.set(client.userId, new Set());
      }
      this.userSockets.get(client.userId)!.add(client.id);

      void client.join(`user:${client.userId}`);

      console.log(
        `User ${client.username} (${client.userId}) connected. Socket: ${client.id}`,
      );

      void client.emit('connected', {
        message: 'Connected to Twitter Clone WebSocket',
        userId: client.userId,
        username: client.username,
      });
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }
      console.log(
        `User ${client.username} (${client.userId}) disconnected. Socket: ${client.id}`,
      );
    }
  }

  notifyNewPost(userId: string, post: any) {
    this.server.to(`user:${userId}`).emit('new-post', {
      type: 'new-post',
      post: post as PostDocument,
    });
  }

  notifyLike(userId: string, likeData: { postId: string; liker: any }) {
    this.server.to(`user:${userId}`).emit('post-liked', {
      type: 'post-liked',
      ...likeData,
    });
  }

  notifyMention(userId: string, mentionData: { postId: string; author: any }) {
    this.server.to(`user:${userId}`).emit('mentioned', {
      type: 'mentioned',
      ...mentionData,
    });
  }

  notifyFollow(userId: string, follower: any) {
    this.server.to(`user:${userId}`).emit('new-follower', {
      type: 'new-follower',
      follower: follower as UserDocument,
    });
  }

  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }
}
