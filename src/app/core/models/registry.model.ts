export interface Registry {
  id: string;
  label: string;
  main?: boolean;
  limit?: number;
  records?: string[];
}
