import { jest } from '@jest/globals';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { MembersService } from './members.service';

describe('MembersService', () => {
  let service: MembersService;

  // Mock the Mongoose model so tests don't need a real database.
  const memberModel = {
  create: jest.fn<
    (data: Record<string, unknown>) => Promise<Record<string, unknown>>
  >(),

  findOne: jest.fn<
    (filter: { email: string }) => {
      exec: () => Promise<unknown>;
    }
  >(),

  findById: jest.fn<
    (id: string) => {
      exec: () => Promise<unknown>;
    }
  >(),
};

  beforeEach(() => {
    jest.clearAllMocks();
    service = new MembersService(memberModel as any);
  });

  describe('create', () => {
    it('should hash the password and normalize the email', async () => {
      memberModel.create.mockImplementation(
  async (data: Record<string, unknown>) => data,
);

      const result = await service.create({
        firstName: 'John',
        lastName: 'Doe',
        email: '  JOHN@EXAMPLE.COM ',
        password: 'temporary123',
      });

      expect(memberModel.create).toHaveBeenCalledTimes(1);

      const savedMember = memberModel.create.mock.calls[0][0] as {
        email: string;
        passwordHash: string;
        password?: string;
        };

      expect(savedMember.email).toBe('john@example.com');
      expect(savedMember.passwordHash).not.toBe('temporary123');
      expect(savedMember.password).toBeUndefined();

      // Confirm the stored hash matches the original password.
      expect(
        await bcrypt.compare('temporary123', savedMember.passwordHash),
      ).toBe(true);

      expect(result.email).toBe('john@example.com');
    });

    it('should throw ConflictException for duplicate emails', async () => {
      memberModel.create.mockRejectedValue({ code: 11000 });

      await expect(
        service.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'temporary123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should normalize the email before searching', async () => {
      const member = { email: 'john@example.com' };

const exec = jest.fn<() => Promise<unknown>>().mockResolvedValue(member);
      memberModel.findOne.mockReturnValue({ exec });

      const result = await service.findByEmail('  JOHN@EXAMPLE.COM ');

      expect(memberModel.findOne).toHaveBeenCalledWith({
        email: 'john@example.com',
      });
      expect(result).toEqual(member);
    });
  });

describe('findById', () => {
  it('should find a member by MongoDB ID', async () => {
    const member = { _id: '123', email: 'john@example.com' };

    const exec = jest
      .fn<() => Promise<unknown>>()
      .mockResolvedValue(member);

    memberModel.findById.mockReturnValue({ exec });

    const result = await service.findById('123');

    expect(memberModel.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual(member);
  });
});
});
