import { JsonFileIngestor } from "../ingestion/ingestors/json-file.ingestor";
import { JsonJobNormalizer } from "../ingestion/normalizers/json-job.normalizer";
import { JobIngestionService } from "../ingestion/job-ingestion.service";
import { JobSourceType } from "../domain/job/job.types";
import { JobRepository } from "../repositories/job.repository";
import { CanonicalJobResolverService } from "../ingestion/deduplication/canonical-job-resolver.service";
import { prisma } from "../lib/prisma";

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const filePath = getArg("--file");
  const source = (getArg("--source") as JobSourceType) || "OTHER";

  if (!filePath) {
    console.error("Usage: ingest-json --file <path> [--source SOURCE]");
    process.exit(1);
  }

  const ingestor = new JsonFileIngestor(filePath, source);
  const normalizers = [new JsonJobNormalizer()];
  const repository = new JobRepository();
  const canonicalJobResolver = new CanonicalJobResolverService(prisma);

  const service = new JobIngestionService(
    ingestor,
    normalizers,
    repository,
    canonicalJobResolver
  );

  const result = await service.run();

  console.log("Ingestion finished");
  console.log(`Ingested: ${result.ingested}`);
  console.log(`Skipped:  ${result.skipped}`);
  console.log(`Updated:  ${result.updated}`);
}

main().catch((err) => {
  console.error("Ingestion failed");
  console.error(err);
  process.exit(1);
});
