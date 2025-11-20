import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

describe('Database Operations Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:password@localhost:5432/there_test',
        },
      },
    });

    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.conversationMessage.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.userRelationship.deleteMany();
    await prisma.user.deleteMany();
    await prisma.ethicalConfig.deleteMany();
    await prisma.adminUser.deleteMany();

    await prisma.$disconnect();
  });

  describe('User Operations', () => {
    it('should create a new user', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedpassword',
          name: 'Test User',
        },
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
    });

    it('should find user by email', async () => {
      await prisma.user.create({
        data: {
          email: 'findme@example.com',
          passwordHash: 'hashedpassword',
          name: 'Find Me',
        },
      });

      const user = await prisma.user.findUnique({
        where: { email: 'findme@example.com' },
      });

      expect(user).not.toBeNull();
      expect(user?.email).toBe('findme@example.com');
    });

    it('should update user profile', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'update@example.com',
          passwordHash: 'hashedpassword',
          name: 'Original Name',
        },
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Updated Name' },
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.email).toBe('update@example.com');
    });

    it('should enforce unique email constraint', async () => {
      await prisma.user.create({
        data: {
          email: 'unique@example.com',
          passwordHash: 'hashedpassword',
          name: 'User 1',
        },
      });

      await expect(
        prisma.user.create({
          data: {
            email: 'unique@example.com',
            passwordHash: 'hashedpassword',
            name: 'User 2',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Relationship Operations', () => {
    let userId: string;

    beforeAll(async () => {
      const user = await prisma.user.create({
        data: {
          email: 'relationship@example.com',
          passwordHash: 'hashedpassword',
          name: 'Relationship User',
        },
      });
      userId = user.id;
    });

    it('should create a user relationship', async () => {
      const relationship = await prisma.userRelationship.create({
        data: {
          userId,
          roleType: 'father',
          customName: 'Dad',
          isActive: true,
        },
      });

      expect(relationship).toHaveProperty('id');
      expect(relationship.roleType).toBe('father');
      expect(relationship.customName).toBe('Dad');
    });

    it('should retrieve relationships for a user', async () => {
      await prisma.userRelationship.create({
        data: {
          userId,
          roleType: 'mother',
          customName: 'Mom',
          isActive: true,
        },
      });

      const relationships = await prisma.userRelationship.findMany({
        where: { userId },
      });

      expect(relationships.length).toBeGreaterThan(0);
    });

    it('should create conversation for relationship', async () => {
      const relationship = await prisma.userRelationship.create({
        data: {
          userId,
          roleType: 'sibling',
          customName: 'Sister',
          isActive: true,
        },
      });

      const conversation = await prisma.conversation.create({
        data: {
          relationshipId: relationship.id,
          title: 'First Chat',
        },
      });

      expect(conversation).toHaveProperty('id');
      expect(conversation.relationshipId).toBe(relationship.id);
    });
  });

  describe('Ethical Config Operations', () => {
    it('should create ethical configuration', async () => {
      const config = await prisma.ethicalConfig.create({
        data: {
          name: 'Test Config',
          description: 'Test ethical configuration',
          rules: ['rule1', 'rule2'],
          isActive: true,
          version: 1,
        },
      });

      expect(config).toHaveProperty('id');
      expect(config.rules).toEqual(['rule1', 'rule2']);
    });

    it('should retrieve active configs only', async () => {
      await prisma.ethicalConfig.create({
        data: {
          name: 'Active Config',
          description: 'Active',
          rules: [],
          isActive: true,
          version: 1,
        },
      });

      await prisma.ethicalConfig.create({
        data: {
          name: 'Inactive Config',
          description: 'Inactive',
          rules: [],
          isActive: false,
          version: 1,
        },
      });

      const activeConfigs = await prisma.ethicalConfig.findMany({
        where: { isActive: true },
      });

      expect(activeConfigs.every((c) => c.isActive)).toBe(true);
    });
  });

  describe('Transaction Operations', () => {
    it('should rollback on error', async () => {
      const user = await prisma.user.create({
        data: {
          email: 'transaction@example.com',
          passwordHash: 'hashedpassword',
          name: 'Transaction User',
        },
      });

      try {
        await prisma.$transaction(async (tx) => {
          await tx.userRelationship.create({
            data: {
              userId: user.id,
              roleType: 'father',
              customName: 'Dad',
              isActive: true,
            },
          });

          // This should fail due to duplicate email
          await tx.user.create({
            data: {
              email: 'transaction@example.com',
              passwordHash: 'hashedpassword',
              name: 'Duplicate',
            },
          });
        });
      } catch (error) {
        // Transaction should have rolled back
      }

      const relationships = await prisma.userRelationship.findMany({
        where: { userId: user.id },
      });

      expect(relationships).toHaveLength(0);
    });
  });
});
