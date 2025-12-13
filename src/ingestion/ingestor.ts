import { JobSourceType } from "../domain/job/job.types";

/**
 * A single raw job coming from an external source.
 * Its shape is source-specific and intentionally unknown here.
 */
export interface RawIngestedJob {
  source: JobSourceType;
  raw: unknown;
}

/**
 * Result of an ingestion run.
 * Contains raw jobs + metadata about the fetch itself.
 */
export interface IngestionResult {
  jobs: RawIngestedJob[];
  fetchedAt: Date;
}

/**
 * Ingestors are responsible ONLY for fetching raw jobs
 * from an external source (API, scrape, file, etc).
 */
export interface JobIngestor {
  readonly source: JobSourceType;
  ingest(): Promise<IngestionResult>;
}
