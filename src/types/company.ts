export interface Company {
  id: string;
  name: string;
  logoUrl?: string | null;
  logoText: string;
  location: string;
  industry: string;
  employees: string;
  jobsOpen: number;
  tagline: string;
}
