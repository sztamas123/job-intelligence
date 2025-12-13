import { JobNormalizer } from "../normalizer";
import { RawIngestedJob } from "../ingestor";
import {
  JobPosting,
  JobSourceType,
  RemoteType,
  EmploymentType,
  Seniority,
} from "../../domain/job/job.types";

export class JsonJobNormalizer implements JobNormalizer {
  supports(source: JobSourceType): boolean {
    return source === "OTHER" || source === "COMPANY_SITE";
  }

  normalize(
    job: RawIngestedJob
  ): Omit<JobPosting, "id"> | null {
    const raw = job.raw as any;

    // Required fields
    if (
      !raw ||
      !raw.id ||
      !raw.title ||
      !raw.company ||
      !raw.location ||
      !raw.description ||
      !raw.url
    ) {
      return null;
    }

    return {
      source: job.source,
      sourceId: String(raw.id),
      sourceUrl: String(raw.url),

      title: String(raw.title),
      company: String(raw.company),
      location: String(raw.location),

      remoteType: this.mapRemoteType(raw),
      employmentType: this.mapEmploymentType(raw),
      seniority: this.mapSeniority(raw),

      descriptionRaw: String(raw.description),

      postedAt: raw.postedAt ? new Date(raw.postedAt) : undefined,
      // scrapedAt is added by the ingestion service
      scrapedAt: undefined as any, // placeholder, overwritten later
    };
  }

  private mapRemoteType(raw: any): RemoteType {
    if (raw.remote === true) return "REMOTE";
    if (raw.remote === false) return "ONSITE";

    if (typeof raw.remote === "string") {
      const v = raw.remote.toLowerCase();
      if (v.includes("remote")) return "REMOTE";
      if (v.includes("hybrid")) return "HYBRID";
    }

    return "ONSITE";
  }

  private mapEmploymentType(raw: any): EmploymentType {
    const v = String(raw.employmentType || "").toLowerCase();

    if (v.includes("contract")) return "CONTRACT";
    if (v.includes("part")) return "PART_TIME";

    return "FULL_TIME";
  }

  private mapSeniority(raw: any): Seniority {
    const v = String(raw.seniority || "").toLowerCase();

    if (v.includes("junior")) return "JUNIOR";
    if (v.includes("lead") || v.includes("principal")) return "LEAD";
    if (v.includes("senior")) return "SENIOR";

    return "MID";
  }
}
