export enum RecordRole {
  PARTICIPANT = 'participant',
  ORGANIZER = 'organizer',
  MENTOR = 'mentor',
  GUIDE = 'guide',
  KID = 'kid',
}

export interface CombiRecord {
  email: string;
  name: string;
  role: RecordRole;
  searchTerm: string;
  [key: string]: unknown;
}

export interface RecordListing {
  items: CombiRecord[];
  total: number;
}
