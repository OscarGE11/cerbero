import type { ReactNode } from "react";

export type SortType = "alpha" | "numeric" | "date";
export type FilterType = "none" | "text" | "category" | "number" | "date";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  sortable?: boolean;
  sortType?: SortType;
  filterType?: FilterType;
  className?: string;
  hidden?: "sm" | "md";
  cell: (row: T) => ReactNode;
};

export type DataTableSort = {
  columnId: string;
  order: "asc" | "desc";
};

export type DataTablePagination = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  fetching?: boolean;
  error?: boolean;
  pagination: DataTablePagination;
  filters: Record<string, unknown>;
  onFilterChange: (columnId: string, value: unknown) => void;
  onSortChange: (columnId: string, order: "asc" | "desc" | null) => void;
  sort?: DataTableSort;
  emptyMessage?: ReactNode;
  filteredEmptyMessage?: ReactNode;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  gridClassName: string;
  getRowKey: (row: T) => string;
  renderRow: (row: T) => ReactNode;
};
