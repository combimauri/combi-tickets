export enum RecordRole {
  Asistente = 'ASISTENTE',
  Speaker = 'SPEAKER',
  Staff = 'STAFF',
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
