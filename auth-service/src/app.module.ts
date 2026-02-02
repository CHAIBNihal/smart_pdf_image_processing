import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { UploadsModule } from './uploads/uploads.module';
import { UploadsController } from './uploads/uploads.controller';
import { SupabaseModule } from './supabase/supabase.module';
// import { KafkaController } from './kafka/kafka.controller';
import { KafkaModule } from './kafka/kafka.module';


@Module({
  imports: [AuthModule, PrismaModule, UserModule, UploadsModule, SupabaseModule, KafkaModule],
  controllers: [AuthController, UserController, UploadsController],
  providers: [AuthService],
  // exports : [AuthService]
})
export class AppModule {}
