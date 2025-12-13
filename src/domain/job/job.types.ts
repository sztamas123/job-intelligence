export type JobSourceType =
  | "LINKEDIN"
  | "INDEED"
  | "COMPANY_SITE"
  | "OTHER";

export type RemoteType =
  | "ONSITE"
  | "HYBRID"
  | "REMOTE";

export type EmploymentType =
  | "FULL_TIME"
  | "CONTRACT"
  | "PART_TIME";

export type Seniority =
  | "JUNIOR"
  | "MID"
  | "SENIOR"
  | "LEAD";

export interface JobPosting {
  id: string;

  source: JobSourceType;
  sourceId: string;
  sourceUrl: string;

  title: string;
  company: string;
  location: string;

  remoteType: RemoteType;
  employmentType: EmploymentType;
  seniority: Seniority;

  descriptionRaw: string;

  postedAt?: Date;
  scrapedAt: Date;
}
