import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  filterable?: boolean;
  filterType?: 'select'; 
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  // Pagination props
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  searchable = true,
  searchPlaceholder = "Cari data...",
  pagination,
  onPageChange,
  onPageSizeChange,
  loading = false,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Client-side pagination state (used when no server pagination)
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  // Get columns that are designated as select filters
  const selectFilterColumns = useMemo(() => {
    return columns.filter(col => col.filterType === 'select');
  }, [columns]);

  // Dynamically extract unique options for each select filter
  const selectFilterOptions = useMemo(() => {
    const optionsMap: Record<string, string[]> = {};
    selectFilterColumns.forEach(col => {
      const uniqueVals = new Set<string>();
      data.forEach(item => {
        const val = item[col.key];
        if (val !== null && val !== undefined && val !== '') {
          uniqueVals.add(String(val));
        }
      });
      optionsMap[String(col.key)] = Array.from(uniqueVals).sort();
    });
    return optionsMap;
  }, [data, selectFilterColumns]);

  // Client-side filtering
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Check Select Filters
      let passesSelectFilters = true;
      for (const [key, value] of Object.entries(activeFilters)) {
        if (value && value !== 'all') {
          if (String(item[key]) !== value) {
            passesSelectFilters = false;
            break;
          }
        }
      }

      if (!passesSelectFilters) return false;

      // 2. Check Text Search
      if (!searchTerm) return true;

      return columns.some((column) => {
        if (column.filterable === false) return false;
        const value = item[column.key];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (typeof value === 'number') {
          return value.toString().includes(searchTerm);
        }
        return false;
      });
    });
  }, [data, searchTerm, activeFilters, columns]);

  // Reset client page when filters change
  useMemo(() => {
    setClientPage(1);
  }, [searchTerm, activeFilters]);

  const isServerPaginated = !!pagination;
  const pageSizeOptions = [5, 10, 20, 50];

  // Calculate pagination values
  const currentPage = isServerPaginated ? (pagination?.page || 1) : clientPage;
  const pageSize = isServerPaginated ? (pagination?.pageSize || 10) : clientPageSize;
  const totalItems = isServerPaginated ? (pagination?.totalItems || 0) : filteredData.length;
  const totalPages = isServerPaginated ? (pagination?.totalPages || 1) : Math.max(1, Math.ceil(filteredData.length / clientPageSize));
  const hasPrevPage = isServerPaginated ? (pagination?.hasPrevPage || false) : clientPage > 1;
  const hasNextPage = isServerPaginated ? (pagination?.hasNextPage || false) : clientPage < totalPages;

  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Slice data for client-side pagination
  const displayData = isServerPaginated
    ? data
    : filteredData.slice((clientPage - 1) * clientPageSize, clientPage * clientPageSize);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (isServerPaginated) {
      onPageChange?.(page);
    } else {
      setClientPage(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    if (isServerPaginated) {
      onPageSizeChange?.(size);
    } else {
      setClientPageSize(size);
      setClientPage(1);
    }
  };

  // Calculate visible page numbers (max 5)
  const getVisiblePages = useMemo(() => {
    const maxVisible = 5;
    const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      if (start > 1) {
        pages.push('ellipsis-start');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        pages.push('ellipsis-end');
      }
    }

    return pages;
  }, [currentPage, totalPages]);

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const hasActiveFilters = searchTerm !== '' || Object.values(activeFilters).some(v => v !== 'all' && v !== '');

  return (
    <div className="space-y-4">
      {/* Search Bar with Column Filters */}
      {searchable && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {selectFilterColumns.map(col => {
            const keyStr = String(col.key);
            return (
              <Select 
                key={keyStr} 
                value={activeFilters[keyStr] || 'all'} 
                onValueChange={(val) => handleFilterChange(keyStr, val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={`Filter ${col.header}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua {col.header}</SelectItem>
                  {(selectFilterOptions[keyStr] || []).map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setActiveFilters({});
              }}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted hover:bg-muted">
                {columns.map((column) => (
                  <TableHead key={String(column.key)} className="font-semibold whitespace-nowrap bg-muted">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : displayData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    Tidak ada data yang cocok dengan pencarian
                  </TableCell>
                </TableRow>
              ) : (
                displayData.map((item, index) => (
                  <TableRow
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {(() => {
                          if (column.render) return column.render(item);
                          const value = item[column.key];
                          return value === null || value === undefined || value === '' ? '-' : value;
                        })()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - always shown when there's data */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Menampilkan {startItem}-{endItem} dari {totalItems} data
          </div>

          <div className="flex items-center gap-2">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Per halaman:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => handlePageSizeChange(Number(value))}
              >
                <SelectTrigger className="w-[70px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {getVisiblePages.map((page, index) => (
                    typeof page === 'number' ? (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={`${page}-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={!hasNextPage}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  if (!status) return <span>-</span>;

  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    completed: 'default',
    pending: 'secondary',
    failed: 'destructive',
    review: 'outline',
  };

  const colors: Record<string, string> = {
    completed: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    failed: 'bg-destructive/10 text-destructive border-destructive/20',
    review: 'bg-primary/10 text-primary border-primary/20',
  };

  return (
    <Badge variant={variants[status] || 'default'} className={colors[status]}>
      {status}
    </Badge>
  );
}
