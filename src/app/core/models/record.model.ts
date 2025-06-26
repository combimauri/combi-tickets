export enum RecordRole {
  PARTICIPANTE = 'PARTICIPANTE',
  STAFF = 'STAFF',
  MENTOR = 'MENTOR',
  JURADO = 'JURADO',
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
