import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [KafkaService, UserService], 
  exports:[KafkaService]
})
export class KafkaModule {}
