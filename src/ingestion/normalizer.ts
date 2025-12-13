import { JobPosting } from "../domain/job/job.types";
import { RawIngestedJob } from "./ingestor";


export interface JobNormalizer {
  supports(source: JobPosting["source"]): boolean;

  /**
   * Convert raw job data into a JobPosting or return null
   * if the job is invalid or unsupported.
   */
  normalize(
    job: RawIngestedJob
  ): Omit<JobPosting, "id"> | null;
}
