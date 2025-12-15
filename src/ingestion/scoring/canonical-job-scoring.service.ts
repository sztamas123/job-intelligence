import { PrismaClient } from "@prisma/client";
import { CanonicalJobScorer } from "../../domain/scoring/canonical-job.scorer";

export class CanonicalJobScoringService {
  constructor(private readonly prisma: PrismaClient) {}

  async scoreForPosting(postingId: string): Promise<void> {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id: postingId },
      select: {
        canonicalJobId: true,
      },
    });

    if (!posting?.canonicalJobId) {
      return; 
    }

    const job = await this.prisma.canonicalJob.findUnique({
      where: { id: posting.canonicalJobId },
    });

    if (!job) {
      return;
    }

    const score = CanonicalJobScorer.score(job);

    if (job.score === score) {
      return;
    }

    await this.prisma.canonicalJob.update({
      where: { id: job.id },
      data: { score },
    });
  }
}
