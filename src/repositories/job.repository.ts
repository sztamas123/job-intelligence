import { prisma } from "../lib/prisma";
import { JobPosting } from "../domain/job/job.types";
import { JobPosting as PrismaJobPosting } from "@prisma/client";

export class JobRepository {
  async create(job: Omit<JobPosting, "id">): Promise<JobPosting> {
  const created = await prisma.jobPosting.create({
    data: job,
  });

  return mapToDomain(created);
}


  async findById(id: string): Promise<JobPosting | null> {
  const job = await prisma.jobPosting.findUnique({
    where: { id },
  });

  return job ? mapToDomain(job) : null;
}


  async findLatest(limit = 10): Promise<JobPosting[]> {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { scrapedAt: "desc" },
    take: limit,
  });

  return jobs.map(mapToDomain);
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

function mapToDomain(job: PrismaJobPosting): JobPosting {
  return {
    ...job,
    postedAt: job.postedAt ?? undefined,
  };
}