import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertJournalDto } from './dto/upsert-journal.dto';

@Injectable()
export class JournalService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, dto: UpsertJournalDto) {
    const entryDate = new Date(dto.entryDate);

    const journal = await this.prisma.journal.upsert({
      where: {
        userId_entryDate: { userId, entryDate },
      },
      create: {
        userId,
        entryDate,
        mood: dto.mood,
        title: dto.title,
        content: dto.content,
      },
      update: {
        mood: dto.mood,
        title: dto.title,
        content: dto.content,
      },
    });

    return this.toResponse(journal);
  }

  async findByDate(userId: string, date: string) {
    const entryDate = new Date(date);

    const journal = await this.prisma.journal.findUnique({
      where: {
        userId_entryDate: { userId, entryDate },
      },
    });

    return journal ? this.toResponse(journal) : null;
  }

  async findMonthly(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const journals = await this.prisma.journal.findMany({
      where: {
        userId,
        entryDate: { gte: startDate, lte: endDate },
      },
      select: {
        entryDate: true,
        mood: true,
        title: true,
      },
      orderBy: { entryDate: 'asc' },
    });

    return {
      year,
      month,
      entries: journals.map((j) => ({
        entryDate: j.entryDate.toISOString().split('T')[0],
        mood: j.mood,
        title: j.title,
      })),
    };
  }

  async remove(userId: string, id: string) {
    const journal = await this.prisma.journal.findUnique({ where: { id } });

    if (!journal) {
      throw new NotFoundException('Journal not found');
    }

    if (journal.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.prisma.journal.delete({ where: { id } });
  }

  private toResponse(journal: {
    id: string;
    entryDate: Date;
    mood: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: journal.id,
      entryDate: journal.entryDate.toISOString().split('T')[0],
      mood: journal.mood,
      title: journal.title,
      content: journal.content,
      createdAt: journal.createdAt.toISOString(),
      updatedAt: journal.updatedAt.toISOString(),
    };
  }
}
