export interface Registry {
  id: string;
  label: string;
  main?: boolean;
  limit?: number;
  records?: string[];
  protected?: boolean;
  multi?: boolean;
  requiresId?: boolean;
}
