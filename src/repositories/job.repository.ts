import { prisma } from "../lib/prisma";
import { JobPosting } from "../domain/job/job.types";

export class JobRepository {
  async create(job: Omit<JobPosting, "id">): Promise<JobPosting> {
    return prisma.jobPosting.create({
      data: job,
    });
  }

  async findById(id: string): Promise<JobPosting | null> {
    return prisma.jobPosting.findUnique({
      where: { id },
    });
  }

  async findLatest(limit = 10): Promise<JobPosting[]> {
    return prisma.jobPosting.findMany({
      orderBy: { scrapedAt: "desc" },
      take: limit,
    });
  }

  async existsBySource(
    source: JobPosting["source"],
    sourceId: string
  ): Promise<boolean> {
    const count = await prisma.jobPosting.count({
      where: { source, sourceId },
    });
    return count > 0;
  }
}
