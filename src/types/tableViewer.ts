export interface TableBasicInfo {
  count: number;
  name: string;
  type: 'BASE TABLE' | 'VIEW';
}

export interface TableColumnInfo {
  defaultValue?: string;
  foreignKey?: {
    column: string;
    table: string;
  };
  isPrimaryKey: boolean;
  name: string;
  nullable: boolean;
  type: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterCondition {
  column: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}
