import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatedActorDto } from './dtos/created-actor.dto';
import { GetActorDto } from './dtos/get-actor.dto';

@Injectable()
export class ActorService {
    constructor(private prisma: PrismaService) {}

    async createActor(data: CreatedActorDto) {
        const response = await this.prisma.actor.create({
            data: {name: data.name}
        })
        return response
    }

    async getActor(query: GetActorDto) {
        const page = Number(query.page) || 1
        const item_per_page = Number(query.item_per_page)  || 10

        return this.prisma.actor.findMany({
            skip: (page -1) * item_per_page,
            take: item_per_page
        })
    }

    async updateActor(actor_id: number, data: CreatedActorDto) {
        return this.prisma.actor.update({
            where: {actor_id},
            data: data
        })
    }

    async deleteActor(actor_id: number) {
        return this.prisma.actor.delete({where: {actor_id}})
    }
}