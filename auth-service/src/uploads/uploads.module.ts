import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SupabaseService } from 'src/supabase/supabase.service';

@Module({
  imports : [PrismaModule],
  providers: [UploadsService, SupabaseService],
  controllers: [UploadsController], 
  exports : [UploadsService, SupabaseService]
})
export class UploadsModule {}
