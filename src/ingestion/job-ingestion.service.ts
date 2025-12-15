import { JobIngestor } from "./ingestor";
import { JobNormalizer } from "./normalizer";
import { JobPosting } from "../domain/job/job.types";
import { JobRepository } from "../repositories/job.repository";
import { CanonicalJobResolverService } from "./deduplication/canonical-job-resolver.service";
import { CanonicalJobScoringService } from "./scoring/canonical-job-scoring.service";

export class JobIngestionService {
  constructor(
    private readonly ingestor: JobIngestor,
    private readonly normalizers: JobNormalizer[],
    private readonly jobRepository: JobRepository,
    private readonly canonicalJobResolver: CanonicalJobResolverService,
    private readonly canonicalJobScoringService: CanonicalJobScoringService
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
        const hasChanges =
          existingJob.title !== normalized.title ||
          existingJob.company !== normalized.company ||
          existingJob.location !== normalized.location ||
          existingJob.remoteType !== normalized.remoteType ||
          existingJob.employmentType !== normalized.employmentType ||
          existingJob.seniority !== normalized.seniority ||
          existingJob.descriptionRaw !== normalized.descriptionRaw ||
          existingJob.postedAt?.toISOString() !==
            normalized.postedAt?.toISOString();

        if (hasChanges) {
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

          await this.canonicalJobResolver.resolveForPosting(existingJob.id);
          await this.canonicalJobScoringService.scoreForPosting(existingJob.id);

          updated++;
        } else {
          skipped++;
        }
      } else {
        const jobToCreate: Omit<JobPosting, "id"> = {
          ...normalized,
          scrapedAt: new Date(),
        };

        const created =
          await this.jobRepository.create(jobToCreate);

        await this.canonicalJobResolver.resolveForPosting(created.id);
        await this.canonicalJobScoringService.scoreForPosting(created.id);

        ingested++;
      }
    }

    return { ingested, skipped, updated };
  }
}
