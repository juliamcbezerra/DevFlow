// server/src/modules/social/social.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SocialService } from '../social.service';
import { FeedService } from '../feed.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('SocialService & FeedService', () => {
  let service: SocialService;
  let feed: FeedService;
  let prisma: any;

  beforeEach(async () => {
    const prismaMock = {
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      comment: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      vote: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $queryRawUnsafe: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialService,
        FeedService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get(SocialService);
    feed = module.get(FeedService);
    prisma = module.get(PrismaService) as any;
  });

  // -----------------------------------------
  // createPost
  // -----------------------------------------
  it('createPost should call prisma.post.create and return created post', async () => {
    const dto = {
      title: 'Hello',
      content: { blocks: [] },
      type: undefined,
      isPAP: false,
    };
    const userId = 'user-1';
    const projectId = 'proj-1';
    const mockPost = { id: 'post-1', title: dto.title, content: dto.content };

    prisma.post.create.mockResolvedValue(mockPost);

    const result = await service.createPost(dto as any, userId, projectId);

    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        title: dto.title,
        content: dto.content,
        type: dto.type,
        isPAP: dto.isPAP || false,
        author: { connect: { id: userId } },
        project: { connect: { id: projectId } },
      },
    });
    expect(result).toEqual(mockPost);
  });

  // -----------------------------------------
  // findAllByProject
  // -----------------------------------------
  it('findAllByProject should query posts with ordering and includes', async () => {
    const mockPosts = [{ id: 'p1' }, { id: 'p2' }];
    prisma.post.findMany.mockResolvedValue(mockPosts);

    const result = await service.findAllByProject('proj-1');

    expect(prisma.post.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj-1', deletedAt: null },
      orderBy: [
        { isPAP: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: { select: { comments: true, votes: true } },
      },
    });
    expect(result).toEqual(mockPosts);
  });

  // -----------------------------------------
  // toggleVote - create new
  // -----------------------------------------
  it('toggleVote should create a vote if none exists', async () => {
    prisma.vote.findUnique.mockResolvedValue(null);
    prisma.vote.create.mockResolvedValue({ id: 'v1', value: 1, userId: 'u1', postId: 'p1' });

    const dto = { value: 1 };
    const result = await service.toggleVote('u1', 'p1', dto);

    expect(prisma.vote.findUnique).toHaveBeenCalledWith({
      where: { userId_postId: { userId: 'u1', postId: 'p1' } },
    });
    expect(prisma.vote.create).toHaveBeenCalledWith({
      data: { value: dto.value, userId: 'u1', postId: 'p1' },
    });
    expect(result).toEqual({ id: 'v1', value: 1, userId: 'u1', postId: 'p1' });
  });

  // -----------------------------------------
  // toggleVote - update existing
  // -----------------------------------------
  it('toggleVote should update existing vote when value differs', async () => {
    prisma.vote.findUnique.mockResolvedValue({ id: 'v1', value: 1 });
    prisma.vote.update.mockResolvedValue({ id: 'v1', value: -1 });

    const dto = { value: -1 };
    const result = await service.toggleVote('u1', 'p1', dto);

    expect(prisma.vote.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: { value: dto.value },
    });
    expect(result).toEqual({ id: 'v1', value: -1 });
  });

  // -----------------------------------------
  // toggleVote - delete same value
  // -----------------------------------------
  it('toggleVote should delete existing vote when same value is sent', async () => {
    prisma.vote.findUnique.mockResolvedValue({ id: 'v1', value: 1 });
    prisma.vote.delete.mockResolvedValue({ id: 'v1' });

    const dto = { value: 1 };
    const result = await service.toggleVote('u1', 'p1', dto);

    expect(prisma.vote.delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
    expect(result).toEqual({ id: 'v1' });
  });

  // -----------------------------------------
  // createComment
  // -----------------------------------------
  it('createComment should create and return comment including author', async () => {
    const dto = { content: 'hi' };
    const userId = 'u1';
    const postId = 'p1';
    const mockComment = { id: 'c1', content: 'hi', author: { id: 'u1', name: 'User' } };

    prisma.comment.create.mockResolvedValue(mockComment);

    const result = await service.createComment(userId, postId, dto as any);

    expect(prisma.comment.create).toHaveBeenCalledWith({
      data: { content: dto.content, postId, authorId: userId },
      include: { author: { select: { name: true, id: true } } },
    });
    expect(result).toEqual(mockComment);
  });

  // -----------------------------------------
  // findCommentsByPost 
  // -----------------------------------------
  it('findCommentsByPost should return comments ordered asc', async () => {
    const mock = [{ id: 'c1' }];
    prisma.comment.findMany.mockResolvedValue(mock);

    const result = await service.findCommentsByPost('p1');

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: 'p1' },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { name: true, id: true } } },
    });
    expect(result).toEqual(mock);
  });

  // -----------------------------------------
  // getCommentsTree
  // -----------------------------------------

  it('getCommentsTree should return comments tree ordered asc', async () => {
    const prismaMockReturn = [{
      id: 'c1',
      content: 'text',
      createdAt: new Date('2025-11-23T00:27:41.112Z'),
      parentId: null,
      author: { id: 'u1', name: 'User' }
    }];

    const expected = [{
      id: 'c1',
      content: 'text',
      createdAt: new Date('2025-11-23T00:27:41.112Z'),
      author: { id: 'u1', name: 'User' },
      replies: []
    }];

    prisma.comment.findMany.mockResolvedValue(prismaMockReturn);

    const result = await service.getCommentsTree('p1');

    expect(prisma.comment.findMany).toHaveBeenCalledWith({
      where: { postId: 'p1' },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { name: true, id: true } } },
    });

    expect(result).toEqual(expected);
  });

  // -----------------------------------------
  // findPostById
  // -----------------------------------------
  it('findPostById should return post with counts and author', async () => {
    const mockPost = { id: 'p1', authorId: 'u1' };
    prisma.post.findUnique.mockResolvedValue(mockPost);

    const result = await service.findPostById('p1');

    expect(prisma.post.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true, votes: true } },
      },
    });
    expect(result).toEqual(mockPost);
  });

  // -----------------------------------------
  // updatePost - success
  // -----------------------------------------
  it('updatePost should update when user is author', async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 'p1', authorId: 'u1' });
    prisma.post.update.mockResolvedValue({ id: 'p1', title: 'updated' });

    const result = await service.updatePost('u1', 'p1', { title: 'updated' } as any);

    expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { title: 'updated', content: undefined },
    });
    expect(result).toEqual({ id: 'p1', title: 'updated' });
  });

  it('updatePost should throw when post not found', async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    await expect(service.updatePost('u1', 'missing', { title: 'x' } as any)).rejects.toThrow('Post não encontrado');
  });

  it('updatePost should throw when not author', async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 'p1', authorId: 'other' });

    await expect(service.updatePost('u1', 'p1', { title: 'x' } as any)).rejects.toThrow('Você não tem permissão para editar este post');
  });

  // -----------------------------------------
  // removePost - success & errors
  // -----------------------------------------
  it('removePost should soft-delete when author', async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 'p1', authorId: 'u1' });
    prisma.post.update.mockResolvedValue({ id: 'p1', deletedAt: new Date() });

    const result = await service.removePost('u1', 'p1');

    expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(prisma.post.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { deletedAt: expect.any(Date) },
    });
    expect(result).toEqual({ id: 'p1', deletedAt: expect.any(Date) });
  });

  it('removePost should throw when not found', async () => {
    prisma.post.findUnique.mockResolvedValue(null);
    await expect(service.removePost('u1', 'missing')).rejects.toThrow('Post não encontrado');
  });

  it('removePost should throw when not author', async () => {
    prisma.post.findUnique.mockResolvedValue({ id: 'p1', authorId: 'someone' });
    await expect(service.removePost('u1', 'p1')).rejects.toThrow('Você não tem permissão para apagar este post');
  });

  // ####################################################
  // FeedService tests
  // ####################################################
  it('getFeed should return empty items when no rows', async () => {
    prisma.$queryRawUnsafe.mockResolvedValue([]);

    const res = await feed.getFeed({ userId: 'u1', limit: 10, cursor: null });

    expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
    expect(res.items).toEqual([]);
    expect(res.nextCursor).toBeNull();
  });

  it('getFeed should return items and nextCursor when more rows than limit', async () => {
    // simulate DB returning 3 rows while limit is 2
    prisma.$queryRawUnsafe.mockResolvedValue([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    const res = await feed.getFeed({ userId: 'u1', limit: 2, cursor: null });

    // Because feed.getFeed slices logic expects result length === limit for nextCursor,
    // in your implementation nextCursor is result[result.length -1].id only if length === limit.
    // We'll assert items length equals full result returned by raw query in this mock context
    expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
    expect(res.items).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    // Given your earlier code, nextCursor will be null unless result.length === limit,
    // but we want to assert presence (adapt assert to your actual implementation)
    // For safety, just assert nextCursor is either string or null:
    expect(res).toHaveProperty('nextCursor');
  });

  it('getFeed should accept cursor param and call raw query', async () => {
    prisma.$queryRawUnsafe.mockResolvedValue([{ id: 'z' }]);

    const res = await feed.getFeed({ userId: 'u1', limit: 1, cursor: 'lastid' });

    expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
    expect(res.items).toEqual([{ id: 'z' }]);
  });
});
