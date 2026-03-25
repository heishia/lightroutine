import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoutineModule } from './routine/routine.module';
import { TrackingModule } from './tracking/tracking.module';
import { StatisticsModule } from './statistics/statistics.module';
import { JournalModule } from './journal/journal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '..', '..', '..', '.env'),
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    PrismaModule,
    AuthModule,
    RoutineModule,
    TrackingModule,
    StatisticsModule,
    JournalModule,
  ],
})
export class AppModule {}
