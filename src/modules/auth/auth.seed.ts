import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users, UserRole } from '@chronoco/entities/users.entity';
import { ConfigService } from '@nestjs/config';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthSeedService implements OnModuleInit {
  private readonly logger = new Logger(AuthSeedService.name);

  constructor(
    @InjectRepository(Users) private readonly usersRepository: Repository<Users>,
    private readonly configService: ConfigService,
  ) {
  }

  public async onModuleInit(): Promise<void> {
    const superadminExists = await this.usersRepository.exist({ where: { role: UserRole.SUPERADMIN } });
    if (superadminExists) {
      return;
    }

    const login = this.configService.get<string>('SUPERADMIN_LOGIN') || 'admin@local';
    const name = this.configService.get<string>('SUPERADMIN_NAME') || 'Super Admin';
    const passwordPlain = this.configService.get<string>('SUPERADMIN_PASSWORD') || 'ChangeMe123!';
    const password = await bcrypt.hash(passwordPlain, 10);

    const user = this.usersRepository.create({ login, name, password, role: UserRole.SUPERADMIN });
    await this.usersRepository.save(user);
    this.logger.log(`Seeded SUPERADMIN account: ${login}`);
  }
}


