import { readFile } from "fs/promises";
import { JobIngestor, IngestionResult } from "../ingestor";
import { JobSourceType } from "../../domain/job/job.types";

export class JsonFileIngestor implements JobIngestor {
  readonly source: JobSourceType;

  constructor(
    private readonly filePath: string,
    source: JobSourceType = "OTHER"
  ) {
    this.source = source;
  }

  async ingest(): Promise<IngestionResult> {
    const content = await readFile(this.filePath, "utf-8");
    const parsed = JSON.parse(content);

    if (!Array.isArray(parsed)) {
      throw new Error("JSON file must contain an array of jobs");
    }

    return {
      fetchedAt: new Date(),
      jobs: parsed.map((job) => ({
        source: this.source,
        raw: job,
      })),
    };
  }
}
