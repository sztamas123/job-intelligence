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

    for (const rawJob of result.jobs) {
      const normalized = normalizer.normalize(rawJob);

      if (!normalized) {
        skipped++;
        continue;
      }

      const exists = await this.jobRepository.existsBySource(
        normalized.source,
        normalized.sourceId
      );

      if (exists) {
        skipped++;
        continue;
      }

      const jobToCreate: Omit<JobPosting, "id"> = {
        ...normalized,
        scrapedAt: new Date(),
      };

      await this.jobRepository.create(jobToCreate);
      ingested++;
    }

    return { ingested, skipped };
  }
}
