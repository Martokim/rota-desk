
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Member, MemberRole } from './schemas/member.schema';
import { MembersService } from './members.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const email = process.env.COORDINATOR_EMAIL;
    const password = process.env.COORDINATOR_PASSWORD;

    if (!email || !password) {
      throw new Error('Coordinator credentials are missing.');
    }

    const memberModel = app.get<Model<Member>>(getModelToken(Member.name));

    const existingCoordinator = await memberModel.findOne({
      role: MemberRole.COORDINATOR,
    });

    if (existingCoordinator) {
      console.log('A Coordinator account already exists.');
      return;
    }

    const membersService = app.get(MembersService);

    const coordinator = await membersService.create({
      firstName: 'System',
      lastName: 'Coordinator',
      email,
      password,
      role: MemberRole.COORDINATOR,
      mustChangePassword: false,
    });

    console.log(`Coordinator created: ${coordinator.email}`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error) => {
  console.error('Coordinator seeding failed:', error);
  process.exit(1);
});
