enum RecordType {
  GENERAL = 'GENERAL',
  KID = 'KID',
}

export interface Record {
  email: string;
  name: string;
  phone: string;
  searchTerm: string;
  type: RecordType;
  [key: string]: unknown;
}

export interface RecordListing {
  items: Record[];
  total: number;
}
