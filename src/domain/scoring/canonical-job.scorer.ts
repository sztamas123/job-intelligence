import { CanonicalJob } from "@prisma/client";

export class CanonicalJobScorer {
  static score(job: CanonicalJob): number {
    let score = 0;

    score += this.freshnessScore(job);
    score += this.remoteScore(job);
    score += this.seniorityScore(job);
    score += this.completenessScore(job);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Newer jobs are more valuable
   */
  private static freshnessScore(job: CanonicalJob): number {
    const now = Date.now();
    const createdAt = job.createdAt.getTime();
    const ageInDays = (now - createdAt) / (1000 * 60 * 60 * 24);

    if (ageInDays <= 3) return 30;
    if (ageInDays <= 7) return 20;
    if (ageInDays <= 14) return 10;
    return 0;
  }

  /**
   * Max 25 points
   */
  private static remoteScore(job: CanonicalJob): number {
    switch (job.remoteType) {
      case "REMOTE":
        return 25;
      case "HYBRID":
        return 15;
      case "ONSITE":
        return 5;
      default:
        return 0;
    }
  }

  /**
   * Max 25 points
   * Neutral bias for now
   */
  private static seniorityScore(job: CanonicalJob): number {
    switch (job.seniority) {
      case "MID":
        return 25;
      case "SENIOR":
        return 20;
      case "LEAD":
        return 15;
      case "JUNIOR":
        return 10;
      default:
        return 0;
    }
  }

  /**
   * Measures how "complete" the job looks
   */
  private static completenessScore(job: CanonicalJob): number {
    let score = 0;

    if (job.title?.length > 5) score += 5;
    if (job.company?.length > 2) score += 5;
    if (job.location?.length > 2) score += 5;

    return score;
  }
}
