import React from "react";

export default function Pagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
}) {
  const windowSize = 3; 

    
  const normalizedPageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 5;
  const normalizedTotalPages = Math.max(
    1,
    Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1
  );
  const currentPage = Math.min(
    normalizedTotalPages,
    Math.max(1, Number.isFinite(page) && page > 0 ? page : 1)
  );

  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;
  if (end > normalizedTotalPages) {
    end = normalizedTotalPages;
    start = Math.max(1, end - windowSize + 1);
  }

  const changePage = (p) => {
    if (p < 1 || p > normalizedTotalPages) return;
    setPage?.(p);
    if (typeof onPageChange === "function") onPageChange(p);
  };

  const changePageSize = (size) => {
    if (!Number.isFinite(size) || size <= 0) return;
    setPageSize?.(size);
    setPage?.(1);
    if (typeof onPageSizeChange === "function") onPageSizeChange(size);
  };


  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-600">Hiển thị</label>
          <select
            value={normalizedPageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
            className="rounded border border-zinc-200 p-1 text-sm bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changePage(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded border border-zinc-200 disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-sm rounded border border-zinc-200 disabled:opacity-50"
          >
            {"<"}
          </button>

          {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
            <button
              key={p}
              onClick={() => changePage(p)}
              className={`px-3 py-1 rounded-md text-sm border ${
                p === currentPage
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === normalizedTotalPages}
            className="px-2 py-1 text-sm rounded border border-zinc-200 disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            onClick={() => changePage(normalizedTotalPages)}
            disabled={currentPage === normalizedTotalPages}
            className="px-2 py-1 text-sm rounded border border-zinc-200 disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  );
}