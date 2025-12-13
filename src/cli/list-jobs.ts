import { JobRepository } from "../repositories/job.repository";

async function main() {
  const repo = new JobRepository();
  const jobs = await repo.findLatest(5);

  for (const job of jobs) {
    console.log(
      `[${job.source}] ${job.title} @ ${job.company} (${job.remoteType})`
    );
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
