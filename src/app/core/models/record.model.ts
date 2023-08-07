enum RecordType {
  GENERAL = 'GENERAL',
  KID = 'KID',
}

export interface Record {
  email: string;
  name: string;
  phone: string;
  type: RecordType;
}
