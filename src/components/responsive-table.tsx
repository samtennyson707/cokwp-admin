import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Pagination, type PaginationData } from '@/components/ui/pagination';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface ColumnDef<T> {
  id: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  minWidth?: number;
  cardLabel?: string;
  showOn?: 'both' | 'desktop' | 'mobile';
  cardOrder?: number;
  sortable?: boolean;
}

export interface ResponsiveTableProps<T> {
  data: readonly T[];
  columns: readonly ColumnDef<T>[];
  rowKey: (row: T) => string;
  renderCardTitle?: (row: T) => React.ReactNode;
  renderCardSubtitle?: (row: T) => React.ReactNode;
  renderRowEndActions?: (row: T) => React.ReactNode;
  onCardTitleClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  mobileBreakpoint?: number;
  //   pagination?: PaginationData;       
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  sortState?: { columnId: string; direction: 'asc' | 'desc' } | null;
  onSortChange?: (state: { columnId: string; direction: 'asc' | 'desc' }) => void;
}

function useIsMobile(breakpoint: number): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}

export function ResponsiveTable<T>({
  data,
  columns,
  rowKey,
  renderCardTitle,
  renderCardSubtitle,
  renderRowEndActions,
  onCardTitleClick,
  emptyState,
  mobileBreakpoint = 1024,
  sortState = null,
  onSortChange
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile(mobileBreakpoint);
  const visibleDesktopColumns = React.useMemo(() => columns.filter(c => c.showOn !== 'mobile'), [columns]);
  const visibleMobileColumns = React.useMemo(() => columns.filter(c => c.showOn !== 'desktop').sort((a, b) => (a.cardOrder || 0) - (b.cardOrder || 0)), [columns]);
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        {emptyState || <p className="text-xs text-gray-500">No records found.</p>}
      </div>
    );
  }
  if (isMobile) {
    return (
      <div>
        <div className="space-y-3 overflow-x-hidden">
          {data.map((row) => (
            <Card key={rowKey(row)}  >
              <CardContent className="p-4">
                <div className="space-y-4 cursor-pointer" onClick={() => onCardTitleClick?.(row)}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      {renderCardTitle && (
                        onCardTitleClick ? (
                          <button
                            onClick={() => onCardTitleClick(row)}
                            className="text-sm font-medium  cursor-pointer text-left truncate"
                          >
                            {renderCardTitle(row)}
                          </button>
                        ) : (
                          <div className="text-sm font-medium truncate">{renderCardTitle(row)}</div>
                        )
                      )}
                      {renderCardSubtitle && <div className="text-xs truncate">{renderCardSubtitle(row)}</div>}
                    </div>
                    {renderRowEndActions && (
                      <div
                        className="flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); } }}
                      >
                        {renderRowEndActions(row)}
                      </div>
                    )}
                  </div>
                  {visibleMobileColumns.map((col) => (
                    <div key={col.id} className="grid grid-cols-2 gap-4">
                      <span className="text-xs  min-w-0">{col.cardLabel || col.header}</span>
                      <div className="text-xs  min-w-0 break-words whitespace-normal">{col.cell(row)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Pagination */}
        {/* {showPagination && pagination && onPageChange && (
          <div className="mt-4 px-2">
            <Pagination
              pagination={pagination}
              onPageChange={onPageChange}
              compact={true}
            />
          </div>
        )} */}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto bg-card rounded">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {visibleDesktopColumns.map((col) => {
                const isActive = !!sortState && sortState.columnId === col.id;
                const direction = isActive ? sortState!.direction : undefined;
                const canSort = Boolean(col.sortable);
                return (
                  <TableHead
                    key={col.id}
                    className={`table-header px-3 py-2 text-left text-xs font-bold ${col.className || ''}`}
                    style={{ minWidth: col.minWidth ? `${col.minWidth}px` : undefined }}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={() => {
                          if (!onSortChange) return;
                          // Just pass the current column info and let parent decide the direction
                          // The parent knows the current state better than this component
                          onSortChange({ columnId: col.id, direction: direction || 'desc' });
                        }}
                      >
                        <span>{col.header}</span>
                        {isActive ? (
                          direction === 'asc' ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )
                        ) : (
                          <span className="inline-block opacity-40"><ChevronDown className="h-3 w-3" /></span>
                        )}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </TableHead>
                );
              })}
              {renderRowEndActions && (
                <TableHead className="px-3 py-2 sticky right-0 bg-card z-10"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={rowKey(row)} className=" ">
                {visibleDesktopColumns.map((col) => (
                  <TableCell key={col.id} className="px-3 py-2">{col.cell(row)}</TableCell>
                ))}
                {renderRowEndActions && (
                  <TableCell className="px-3 py-2 sticky right-0 bg-card z-10">{renderRowEndActions(row)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Desktop Pagination */}
      {/* {showPagination && pagination && onPageChange && (
        <div className="mt-4">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
          />
        </div>
      )} */}
    </div>
  );
}


