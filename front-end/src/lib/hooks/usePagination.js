import { useMemo } from "react";

/**
 * Client-side pagination hook.
 * @param {Array} items - toàn bộ items (client-side pagination). Nếu server-side, pass [] and use server-provided paged items.
 * @param {number} page
 * @param {number} pageSize
 * @returns {object} { paginated, totalItems, totalPages, offset }
 */
export default function usePagination(items = [], page = 1, pageSize = 5) {
  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const offset = Math.max(0, (page - 1) * pageSize);

  const paginated = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.slice(offset, offset + pageSize);
  }, [items, offset, pageSize]);

  return { paginated, totalItems, totalPages, offset };
}
