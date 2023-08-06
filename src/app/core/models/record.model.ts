enum RecordType {
  GENERAL = 'GENERAL',
  KID = 'KID',
}

export interface Record {
  email: string;
  id: string;
  name: string;
  phone: string;
  type: RecordType;
}
