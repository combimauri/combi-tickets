export enum RecordRole {
  JAMMER = 'JAMMER',
  KID = 'KID',
  STAFF = 'STAFF',
  GUIA = 'GUIA',
  MENTOR = 'MENTOR',
}

export interface CombiRecord {
  id: string;
  email: string;
  name: string;
  role: RecordRole;
  searchTerm: string;
  credentialUrl?: string;
  rfidNumbers?: any[];
  [key: string]: unknown;
}

export interface RecordListing {
  items: CombiRecord[];
  total: number;
}
