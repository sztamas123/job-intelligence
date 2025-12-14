import { JobIngestor } from "./ingestor";
import { JobNormalizer } from "./normalizer";
import { JobPosting } from "../domain/job/job.types";
import { JobRepository } from "../repositories/job.repository";

export class JobIngestionService {
  constructor(
    private readonly ingestor: JobIngestor,
    private readonly normalizers: JobNormalizer[],
    private readonly jobRepository: JobRepository
  ) {}

  async run(): Promise<{
    ingested: number;
    skipped: number;
    updated: number; 
  }> {
    const result = await this.ingestor.ingest();

    const normalizer = this.normalizers.find((n) =>
      n.supports(this.ingestor.source)
    );

    if (!normalizer) {
      throw new Error(
        `No normalizer found for source ${this.ingestor.source}`
      );
    }

    let ingested = 0;
    let skipped = 0;
    let updated = 0; 

    for (const rawJob of result.jobs) {
      const normalized = normalizer.normalize(rawJob);

      if (!normalized) {
        skipped++;
        continue;
      }

      const existingJob = await this.jobRepository.findBySource(
        normalized.source,
        normalized.sourceId
      );

      if (existingJob) {
        // Compare fields and decide whether to update or skip
        if (
          existingJob.title !== normalized.title ||
          existingJob.company !== normalized.company ||
          existingJob.location !== normalized.location ||
          existingJob.remoteType !== normalized.remoteType ||
          existingJob.employmentType !== normalized.employmentType ||
          existingJob.seniority !== normalized.seniority ||
          existingJob.descriptionRaw !== normalized.descriptionRaw ||
          existingJob.postedAt?.toISOString() !== normalized.postedAt?.toISOString()
        ) {
          await this.jobRepository.update(existingJob.id, {
            title: normalized.title,
            company: normalized.company,
            location: normalized.location,
            remoteType: normalized.remoteType,
            employmentType: normalized.employmentType,
            seniority: normalized.seniority,
            descriptionRaw: normalized.descriptionRaw,
            postedAt: normalized.postedAt,
          });
          updated++; 
        } else {
          skipped++; 
        }
      } else {
        const jobToCreate: Omit<JobPosting, "id"> = {
          ...normalized,
          scrapedAt: new Date(),
        };
        await this.jobRepository.create(jobToCreate);
        ingested++; 
      }
    }

    return { ingested, skipped, updated }; 
  }
}
