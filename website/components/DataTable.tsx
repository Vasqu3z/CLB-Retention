'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
  condensed?: boolean; // Hide in condensed mode
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
  highlightRow?: (row: T) => boolean;
  rowClassName?: (row: T) => string;
  enableCondensed?: boolean;
  title?: string;
}

export default function DataTable<T>({
  columns,
  data,
  getRowKey,
  defaultSortKey,
  defaultSortDirection = 'desc',
  highlightRow,
  rowClassName,
  enableCondensed = true,
  title,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [isCondensed, setIsCondensed] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      isHoveringRef.current = true;
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      // Prevent the main page from scrolling when the table is hovered
      event.stopPropagation();

      // When not actively hovering, block the wheel so the main Lenis scroll handles it
      if (!isHoveringRef.current) {
        event.preventDefault();
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Filter columns based on condensed mode
  const visibleColumns = isCondensed
    ? columns.filter(col => !col.condensed)
    : columns;

  // Handle column sort
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // Helper function to get nested property value
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Sort data
  const sortedData = sortKey
    ? [...data].sort((a, b) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);

        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // Handle strings
        const aStr = String(aVal || '');
        const bStr = String(bVal || '');

        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr, undefined, { numeric: true });
        } else {
          return bStr.localeCompare(aStr, undefined, { numeric: true });
        }
      })
    : data;

  return (
    <div className="space-y-4">
      {/* Header */}
      {(title || enableCondensed) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {title && (
            <h2 className="text-2xl font-display font-semibold text-star-white flex items-center gap-2">
              <span className="text-nebula-orange">›</span> {title}
            </h2>
          )}

          {enableCondensed && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              {hiddenColumnsCount > 0 && (
                <span
                  className="control-button" 
                  data-size="pill"
                  data-variant="outline"
                  data-active={isCondensed ? 'true' : undefined}
                >
                  {isCondensed ? 'Condensed' : 'Full view'}
                  <span className="text-star-white/80">•</span>
                  {isCondensed
                    ? `${hiddenColumnsCount} hidden`
                    : 'All columns visible'}
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsCondensed(!isCondensed)}
                aria-label={isCondensed ? 'Expand table to show all columns' : 'Condense table to show fewer columns'}
                className="control-button"
                data-active={!isCondensed}
                data-tone="orange"
              >
                {isCondensed ? (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span>Expand</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span>Condense</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Table or Empty State */}
      {sortedData.length === 0 ? (
        <EmptyState
          icon="database"
          title="No Data Available"
          message="There are currently no entries to display. Check back later or try adjusting your filters."
        />
      ) : (
        <div className="glass-card data-surface rounded-xl">
          <div
            ref={scrollContainerRef}
            className="relative overflow-x-auto overflow-y-auto max-h-[70vh]"
            data-lenis-prevent
          >
            <table className="w-full font-mono text-sm">
              <thead className="bg-space-blue/50 backdrop-blur-md border-b border-cosmic-border sticky top-0 z-10">
                <tr>
                  {visibleColumns.map((column) => (
                    <th
                      key={column.key}
                      className={`
                        px-4 py-3 text-${column.align || 'left'} font-semibold text-star-gray uppercase text-xs tracking-wider
                        ${column.sortable !== false ? 'cursor-pointer hover:text-star-white transition-colors focus:outline-none focus:text-star-white' : ''}
                        ${column.headerClassName || ''}
                      `}
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                      onKeyDown={(e) => {
                        if (column.sortable !== false && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSort(column.key);
                        }
                      }}
                      tabIndex={column.sortable !== false ? 0 : undefined}
                      role={column.sortable !== false ? 'button' : undefined}
                      aria-sort={
                        column.sortable !== false && sortKey === column.key
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      <div className={`flex items-center gap-2 ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : ''}`}>
                        <span>{column.label}</span>
                        {column.sortable !== false && sortKey === column.key && (
                          <span className="text-nebula-orange">
                            {sortDirection === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, idx) => {
                  const isHighlighted = highlightRow?.(row);
                  const customClassName = rowClassName?.(row);

                  return (
                    <tr
                      key={getRowKey(row)}
                      className={`
                        border-b border-cosmic-border/30 transition-all duration-300
                        ${idx % 2 === 0 ? 'bg-space-navy/5' : 'bg-space-navy/15'}
                        ${isHighlighted ? 'bg-nebula-orange/10 border-l-4 border-l-nebula-orange' : 'hover:bg-space-blue/30 hover:border-l-2 hover:border-l-nebula-orange/50'}
                        ${customClassName || ''}
                      `}
                    >
                      {visibleColumns.map((column) => (
                        <td
                          key={column.key}
                          className={`
                            px-4 py-3 text-${column.align || 'left'} text-star-white
                            ${column.className || ''}
                          `}
                        >
                          {column.render ? column.render(row) : String((row as any)[column.key] || '-')}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row count */}
      {sortedData.length > 0 && (
        <div className="text-xs text-star-dim font-mono text-right">
          Showing {sortedData.length} {sortedData.length === 1 ? 'entry' : 'entries'}
          {enableCondensed && hiddenColumnsCount > 0 && (
            <span className="ml-2 text-star-gray">
              • {isCondensed ? `${hiddenColumnsCount} columns hidden` : 'all columns visible'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
