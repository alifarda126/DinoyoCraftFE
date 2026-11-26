"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { EarthySelect } from "@/components/ui/EarthySelect";

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (perPage: number) => void;
  itemLabel?: string;
}

export function TablePagination({
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = "data",
}: TablePaginationProps) {
  if (totalItems <= 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const getVisiblePages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [
      1,
      "...",
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    onPageChange(clamped);
  };

  return (
    <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center flex-wrap gap-3 text-xs text-zinc-600">
        <span>
          Menampilkan{" "}
          <strong className="text-zinc-900">
            {startIndex + 1}–{endIndex}
          </strong>{" "}
          dari <strong className="text-zinc-900">{totalItems}</strong> {itemLabel}
        </span>
        <div className="inline-flex items-center gap-1.5">
          <span className="text-zinc-500">Per halaman:</span>
          <EarthySelect
            value={String(itemsPerPage)}
            onChange={(val) => {
              onItemsPerPageChange(Number(val));
              onPageChange(1);
            }}
            options={[
              { value: "5", label: "5" },
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
            minWidth={80}
            style={{
              height: 32,
              padding: "0.25rem 0.6rem",
              fontSize: "0.78rem",
              fontWeight: 600,
              borderRadius: "0.5rem",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handlePageChange(safeCurrentPage - 1)}
          disabled={safeCurrentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <CaretLeft size={13} weight="bold" />
          Sebelumnya
        </button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, idx) =>
            page === "..." ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-xs text-zinc-400 select-none"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  safeCurrentPage === page
                    ? "bg-zinc-900 text-white"
                    : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={() => handlePageChange(safeCurrentPage + 1)}
          disabled={safeCurrentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Berikutnya
          <CaretRight size={13} weight="bold" />
        </button>
      </div>
    </div>
  );
}
