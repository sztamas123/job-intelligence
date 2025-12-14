import { PrismaClient } from "@prisma/client";
import { JobDedupMatcher } from "../../domain/deduplication/job-deduplication-matcher";

export class CanonicalJobResolverService {
  constructor(private readonly prisma: PrismaClient) {}

  async resolveForPosting(postingId: string): Promise<void> {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id: postingId },
    });

    if (!posting) {
      throw new Error(`JobPosting ${postingId} not found`);
    }

    if (posting.canonicalJobId) {
      return;
    }

    const candidates = await this.prisma.canonicalJob.findMany({
      where: {
        company: posting.company,
        remoteType: posting.remoteType,
        seniority: posting.seniority,
      },
    });

    const match = JobDedupMatcher.findMatchingCanonicalJob(
      posting,
      candidates
    );

    if (match) {
      await this.prisma.jobPosting.update({
        where: { id: posting.id },
        data: { canonicalJobId: match.id },
      });
      return;
    }

    // No match → create new canonical job
    const canonical = await this.prisma.canonicalJob.create({
      data: {
        title: posting.title,
        company: posting.company,
        location: posting.location,
        remoteType: posting.remoteType,
        employmentType: posting.employmentType,
        seniority: posting.seniority,
      },
    });

    await this.prisma.jobPosting.update({
      where: { id: posting.id },
      data: { canonicalJobId: canonical.id },
    });
  }
}
