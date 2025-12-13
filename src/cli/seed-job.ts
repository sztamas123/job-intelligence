import { JobRepository } from "../repositories/job.repository";
import { JobPosting } from "../domain/job/job.types";

async function main() {
  const repo = new JobRepository();

  const job: Omit<JobPosting, "id"> = {
    source: "LINKEDIN",
    sourceId: "demo-123",
    sourceUrl: "https://linkedin.com/jobs/view/demo",

    title: "Senior Backend Engineer",
    company: "Demo Corp",
    location: "Remote",

    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    seniority: "SENIOR",

    descriptionRaw: "We are looking for a senior backend engineer...",
    postedAt: new Date(),
    scrapedAt: new Date(),
  };

  const exists = await repo.existsBySource(job.source, job.sourceId);

  if (exists) {
    console.log("Job already exists, skipping insert.");
    return;
  }

  const created = await repo.create(job);
  console.log("Inserted job:", created.id);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
