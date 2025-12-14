import { prisma } from "../lib/prisma"; // adjust path if needed
import { CanonicalJobResolverService } from "../ingestion/deduplication/canonical-job-resolver.service";

async function main() {
  const resolver = new CanonicalJobResolverService(prisma);

  const postings = await prisma.jobPosting.findMany({
    where: {
      canonicalJobId: null,
    },
    select: {
      id: true,
    },
  });

  console.log(`Found ${postings.length} postings to resolve`);

  for (const posting of postings) {
    await resolver.resolveForPosting(posting.id);
  }

  console.log("Deduplication finished");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
