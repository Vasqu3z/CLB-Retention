"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface RetroTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

export default function RetroTable<T extends { id?: string | number }>({ 
  data, 
  columns, 
  onRowClick,
  isLoading 
}: RetroTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  const handleSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
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

  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-surface-dark/80 backdrop-blur-sm relative group">
      <div className="absolute -inset-[1px] bg-gradient-to-b from-comets-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-xl" />
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-black/40 relative overflow-hidden">
              <th className="absolute inset-0 scanlines opacity-20 pointer-events-none w-full h-full" colSpan={columns.length} />
              
              {columns.map((col, i) => (
                <th 
                  key={i} 
                  className={cn(
                    "p-4 font-ui uppercase text-sm tracking-[0.15em] text-comets-yellow/80 font-bold whitespace-nowrap relative z-10",
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
                (() => {
                  const isSorted = sortConfig?.key === col.accessorKey;
                  if (!isSorted || !sortConfig) return undefined;
                  return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
                })()
              }
            >
                  <div className="flex items-center gap-2">
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
                            <ChevronUp size={14} className="text-comets-cyan" />
                          ) : (
                            <ChevronDown size={14} className="text-comets-cyan" />
                          )
                        ) : (
                          <svg width="14" height="14" fill="currentColor" className="opacity-50">
                            <path d="M7 3L10 6H4L7 3ZM7 11L4 8H10L7 11Z"/>
                          </svg>
                        )}
                      </motion.div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-sm relative z-10">
            {sortedData.map((item, i) => (
              <motion.tr 
                key={item.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={onRowClick ? { x: 4, backgroundColor: "rgba(255,255,255,0.05)" } : {}}
                transition={{ 
                  delay: i * 0.03,
                  duration: 0.3,
                  type: "spring",
                  stiffness: 300
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
                  "border-b border-white/5 transition-all duration-200 group/row relative focus-arcade",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col, j) => (
                  <td key={j} className={cn("p-4 text-white/80 whitespace-nowrap", col.className)}>
                    <div className="relative z-10">
                      {col.cell 
                        ? col.cell(item, i) 
                        : col.accessorKey 
                          ? (item[col.accessorKey] as React.ReactNode) 
                          : null
                      }
                    </div>
                    {j === 0 && (
                      <motion.div 
                        className="absolute left-0 top-0 bottom-0 w-[2px] bg-comets-cyan opacity-0 group-hover/row:opacity-100"
                        initial={{ scaleY: 0 }}
                        whileHover={{ scaleY: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </td>
                ))}
              </motion.tr>
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
  );
}
