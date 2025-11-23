import { Test, TestingModule } from '@nestjs/testing';
import { SocialController } from '../social.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SocialService } from '../social.service';
import { FeedService } from '../feed.service';

describe('SocialController', () => {
  let controller: SocialController;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SocialController],
      providers: [
        SocialService,
        FeedService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    controller = module.get<SocialController>(SocialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
