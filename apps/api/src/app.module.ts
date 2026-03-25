import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoutineModule } from './routine/routine.module';
import { TrackingModule } from './tracking/tracking.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    RoutineModule,
    TrackingModule,
    StatisticsModule,
  ],
})
export class AppModule {}
