import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  itemLabel?: string;
}

const PAGE_SIZE_OPTIONS = [8, 16, 24];

export function TablePagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = "entries",
}: TablePaginationProps) {
  const [showPageSizeMenu, setShowPageSizeMenu] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const rangeStart = Math.max(2, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Showing{" "}
        <span className="font-medium text-gray-700">{start}</span>
        {" "}–{" "}
        <span className="font-medium text-gray-700">{end}</span>
        {" "}of{" "}
        <span className="font-medium text-gray-700">{totalItems}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex items-center gap-4">
        {/* Page size selector */}
        <div className="relative">
          <button
            onClick={() => setShowPageSizeMenu((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {pageSize} per page
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showPageSizeMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPageSizeMenu(false)}
              />
              <div className="absolute right-0 bottom-full mb-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden min-w-[130px]">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      onPageSizeChange(size);
                      onPageChange(1);
                      setShowPageSizeMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors ${
                      size === pageSize
                        ? "bg-[#415192]/8 text-[#415192] font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {size} per page
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {getPageNumbers().map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 text-center text-sm text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? "bg-[#415192] text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
