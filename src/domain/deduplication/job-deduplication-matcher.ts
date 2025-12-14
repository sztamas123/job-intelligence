import { CanonicalJob, JobPosting } from "@prisma/client";

/**
 * Very strict v1 matcher.
 * If this returns a CanonicalJob, we are confident it's the same real job.
 * If not, caller must create a new CanonicalJob.
 */
export class JobDedupMatcher {
  static findMatchingCanonicalJob(
    posting: JobPosting,
    canonicalJobs: CanonicalJob[]
  ): CanonicalJob | null {
    for (const canonical of canonicalJobs) {
      if (!this.sameCompany(posting, canonical)) continue;
      if (!this.sameLocation(posting, canonical)) continue;
      if (!this.sameRemoteType(posting, canonical)) continue;
      if (!this.similarTitle(posting, canonical)) continue;

      return canonical;
    }

    return null;
  }

  private static sameCompany(
    posting: JobPosting,
    canonical: CanonicalJob
  ): boolean {
    return normalize(posting.company) === normalize(canonical.company);
  }

  private static sameLocation(
    posting: JobPosting,
    canonical: CanonicalJob
  ): boolean {
    return normalize(posting.location) === normalize(canonical.location);
  }

  private static sameRemoteType(
    posting: JobPosting,
    canonical: CanonicalJob
  ): boolean {
    return posting.remoteType === canonical.remoteType;
  }

  private static similarTitle(
    posting: JobPosting,
    canonical: CanonicalJob
  ): boolean {
    const p = normalize(posting.title);
    const c = normalize(canonical.title);

    // strict but effective for v1
    return p.includes(c) || c.includes(p);
  }
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
