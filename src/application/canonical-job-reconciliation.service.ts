import { PrismaClient, RemoteType, Seniority } from "@prisma/client";

export class CanonicalJobReconciliationService {
  constructor(private readonly prisma: PrismaClient) {}

  async reconcileForPosting(postingId: string): Promise<void> {
    const posting = await this.prisma.jobPosting.findUnique({
      where: { id: postingId },
      select: { canonicalJobId: true },
    });

    if (!posting?.canonicalJobId) {
      return;
    }

    await this.reconcile(posting.canonicalJobId);
  }

  private async reconcile(canonicalJobId: string): Promise<void> {
    const postings = await this.prisma.jobPosting.findMany({
      where: { canonicalJobId },
    });

    if (postings.length === 0) return;

    const title = this.longest(postings.map(p => p.title));
    const company = this.mostFrequent(postings.map(p => p.company));
    const location = this.mostFrequent(postings.map(p => p.location));
    const employmentType = this.mostFrequent(postings.map(p => p.employmentType));
    const remoteType = this.maxRemote(postings.map(p => p.remoteType));
    const seniority = this.maxSeniority(postings.map(p => p.seniority));

    await this.prisma.canonicalJob.update({
      where: { id: canonicalJobId },
      data: {
        title,
        company,
        location,
        employmentType,
        remoteType,
        seniority,
      },
    });
  }

  private longest(values: string[]): string {
    return values.reduce((a, b) => (b.length > a.length ? b : a));
  }

  private mostFrequent<T>(values: T[]): T {
    const map = new Map<T, number>();
    for (const v of values) {
      map.set(v, (map.get(v) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  private maxRemote(values: RemoteType[]): RemoteType {
    const order: RemoteType[] = ["ONSITE", "HYBRID", "REMOTE"];
    return values.sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
  }

  private maxSeniority(values: Seniority[]): Seniority {
    const order: Seniority[] = ["JUNIOR", "MID", "SENIOR", "LEAD"];
    return values.sort((a, b) => order.indexOf(b) - order.indexOf(a))[0];
  }
}
