import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

const publicUserSelect = {
  id: true,
  name: true,
  avatar: true,
  bio: true,
  location: true,
  instruments: true,
  genres: true,
  createdAt: true,
  _count: {
    select: {
      posts: true,
      followers: true,
      following: true,
    },
  },
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string, viewerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')

    let isFollowing = false
    if (viewerId && viewerId !== id) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: viewerId, followingId: id },
        },
      })
      isFollowing = !!follow
    }

    return { ...user, isFollowing }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: publicUserSelect,
    })
  }

  async getUserPosts(userId: string) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        content: true,
        mediaUrl: true,
        createdAt: true,
        author: {
          select: { id: true, name: true, avatar: true, instruments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }

  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('No puedes seguirte a ti mismo')
    }
    // upsert evita duplicados sin lanzar error si ya existe el follow
    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      create: { followerId, followingId },
      update: {},
    })
    return { success: true }
  }

  async unfollowUser(followerId: string, followingId: string) {
    // deleteMany no lanza error si el registro no existe
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    })
    return { success: true }
  }

  async searchUsers(
    viewerId: string,
    search?: string,
    instrument?: string,
    genre?: string,
  ) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: viewerId },
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(instrument && { instruments: { has: instrument } }),
        ...(genre && { genres: { has: genre } }),
      },
      select: {
        ...publicUserSelect,
        // Traemos solo el follow del viewer para saber si ya sigue a cada usuario
        followers: {
          where: { followerId: viewerId },
          select: { followerId: true },
        },
      },
      take: 30,
      orderBy: { createdAt: 'desc' },
    })

    // Convertimos el array followers en un booleano isFollowing
    return users.map(({ followers, ...user }) => ({
      ...user,
      isFollowing: followers.length > 0,
    }))
  }
}
