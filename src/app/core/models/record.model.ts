export enum RecordRole {
  Asistente = 'ASISTENTE',
  Mentor = 'MENTOR',
  Staff = 'STAFF',
}

export interface CombiRecord {
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
