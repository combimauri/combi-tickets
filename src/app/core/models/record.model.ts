export enum RecordRole {
  Asistente = 'Asistente',
  Speaker = 'Speaker',
  Staff = 'Staff',
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
