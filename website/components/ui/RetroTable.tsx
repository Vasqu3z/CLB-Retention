"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  condensed?: boolean; // Column only shown in advanced mode
}

interface RetroTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  showAdvanced?: boolean; // Show condensed columns (default: true)
  separatorAfterIndex?: number; // Show a separator line after this row index
  separatorLabel?: string; // Label to display in separator
}

type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

export default function RetroTable<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  isLoading,
  showAdvanced = true,
  separatorAfterIndex,
  separatorLabel
}: RetroTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  // Filter columns based on showAdvanced prop
  const visibleColumns = React.useMemo(() => {
    if (showAdvanced) return columns;
    return columns.filter(col => !col.condensed);
  }, [columns, showAdvanced]);

  const handleSort = (key: keyof T) => {
    // Default to descending (high to low) for first click - most stats are "higher is better"
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);
  
  if (isLoading) {
    return (
      <div className="w-full rounded-xl border border-white/10 bg-surface-dark/80 backdrop-blur-sm overflow-hidden">
        <div className="p-12 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-comets-cyan border-t-transparent rounded-full"
          />
          <div className="text-comets-cyan font-ui tracking-widest uppercase animate-pulse">
            Loading Data...
          </div>
        </div>
      </div>
    );
  }

  // Generate unique keys for columns based on their header or accessorKey
  const getColumnKey = (col: Column<T>, index: number) => {
    if (col.accessorKey) return String(col.accessorKey);
    if (typeof col.header === 'string') return col.header;
    return `col-${index}`;
  };

  return (
    <LayoutGroup>
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-surface-dark/80 backdrop-blur-sm relative group">
        {/* Glow effect on hover */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-comets-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-xl" />

        {/* Scanlines overlay - outside of table structure */}
        <div className="absolute inset-0 scanlines opacity-10 pointer-events-none z-20" />

        <div>
          <table className="w-full text-left border-collapse min-w-full">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <AnimatePresence mode="popLayout">
                  {visibleColumns.map((col, i) => (
                    <motion.th
                      key={getColumnKey(col, i)}
                      layout
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className={cn(
                        "px-4 py-3 font-ui uppercase text-xs tracking-[0.1em] text-comets-yellow/80 font-bold whitespace-nowrap overflow-hidden",
                        col.sortable && "cursor-pointer hover:text-comets-yellow transition-colors select-none",
                        col.className
                      )}
                      onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                      onKeyDown={(e) => {
                        if (col.sortable && col.accessorKey && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSort(col.accessorKey);
                        }
                      }}
                      tabIndex={col.sortable ? 0 : undefined}
                      role={col.sortable ? "button" : undefined}
                      aria-sort={
                        sortConfig?.key === col.accessorKey
                          ? sortConfig?.direction === 'asc' ? 'ascending' : 'descending'
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        {col.header}
                        {col.sortable && col.accessorKey && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: sortConfig?.key === col.accessorKey ? 1 : 0.3
                            }}
                            className="flex flex-col"
                          >
                            {sortConfig?.key === col.accessorKey ? (
                              sortConfig.direction === 'asc' ? (
                                <ChevronUp size={12} className="text-comets-cyan" />
                              ) : (
                                <ChevronDown size={12} className="text-comets-cyan" />
                              )
                            ) : (
                              <svg width="12" height="12" fill="currentColor" className="opacity-50">
                                <path d="M6 2L9 5H3L6 2ZM6 10L3 7H9L6 10Z"/>
                              </svg>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </motion.th>
                  ))}
                </AnimatePresence>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {sortedData.map((item, i) => (
                <React.Fragment key={item.id || i}>
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={onRowClick ? { backgroundColor: "rgba(255,255,255,0.05)" } : {}}
                    transition={{
                      layout: { duration: 0.15 },
                      delay: Math.min(i * 0.015, 0.25), // Faster stagger, capped for performance
                      duration: 0.15,
                    }}
                    onClick={() => onRowClick && onRowClick(item)}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : -1}
                    className={cn(
                      "border-b border-white/5 transition-colors duration-150 group/row relative focus-arcade",
                      onRowClick && "cursor-pointer hover:bg-white/5"
                    )}
                  >
                    <AnimatePresence mode="popLayout">
                      {visibleColumns.map((col, j) => (
                        <motion.td
                          key={getColumnKey(col, j)}
                          layout
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={cn("px-4 py-3 text-white/80 overflow-hidden", col.className)}
                        >
                          {col.cell
                            ? col.cell(item, i)
                            : col.accessorKey
                              ? (item[col.accessorKey] as React.ReactNode)
                              : null
                          }
                          {j === 0 && (
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 w-[2px] bg-comets-cyan opacity-0 group-hover/row:opacity-100"
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </motion.td>
                      ))}
                    </AnimatePresence>
                  </motion.tr>
                  {/* Separator row after specified index */}
                  {separatorAfterIndex !== undefined && i === separatorAfterIndex && (
                    <motion.tr
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="relative"
                    >
                      <td colSpan={visibleColumns.length} className="p-0">
                        <div className="relative py-2">
                          {/* Glowing line */}
                          <div className="h-[2px] bg-gradient-to-r from-transparent via-comets-cyan to-transparent shadow-[0_0_10px_rgba(0,243,255,0.5)]" />
                          {/* Label */}
                          {separatorLabel && (
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-surface-dark">
                              <span className="text-[10px] font-ui uppercase tracking-[0.3em] text-comets-cyan/80">
                                {separatorLabel}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      
        {sortedData.length === 0 && !isLoading && (
          <motion.div
            className="p-12 text-center text-white/30 font-ui uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-2 text-2xl">◊</div>
            No Data Found
          </motion.div>
        )}
      </div>
    </LayoutGroup>
  );
}
