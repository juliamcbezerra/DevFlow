import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FeedService {
    constructor(private prisma: PrismaService) {}

    async getFeed({
        userId,
        limit = 20,
        cursor,
    }: {
        userId: string;
        limit?: number;
        cursor?: string;
    }) {
        const params: any[] = [userId, limit];

        const cursorFilter = cursor ? `AND p."createdAt" < (SELECT "createdAt" FROM "Post" WHERE id = $3)`: ``;

        if (cursor) params.push(cursor);

        const result = await this.prisma.$queryRawUnsafe<any[]>(`
            SELECT
                p.id,
                p.title,
                p.content,
                p."createdAt",
                p."updatedAt",
                p.type,
                p."projectId",

                json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email
                ) AS author,

                (SELECT COUNT(*) FROM "Comment" c WHERE c."postId" = p.id) AS "commentCount",

                (SELECT COALESCE(SUM(v.value), 0) FROM "Vote" v WHERE v."postId" = p.id) AS "voteScore"

            FROM "Post" p
            JOIN "Project" pr ON pr.id = p."projectId"
            JOIN "User" u ON u.id = p."authorId"

            WHERE
                pr."ownerId" = $1
                OR EXISTS (
                    SELECT 1
                    FROM "FollowProject" fp
                    WHERE fp."projectId" = pr.id
                    AND fp."userId" = $1
                )

            ${cursor ? `AND p.id < '${cursor}'` : ''}

            ORDER BY p."createdAt" DESC
            LIMIT ${limit};
        `, userId);

        return {
            items: result,
            nextCursor:
                result.length === limit
                    ? result[result.length - 1].id
                    : null,
        };
    }
}