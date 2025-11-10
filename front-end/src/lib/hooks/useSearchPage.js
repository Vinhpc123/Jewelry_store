// dùng để tìm kiếm với debounce và quản lý trạng thái tải
import { useEffect, useMemo, useState } from "react";
import instance from "../api";

const EMPTY_PARAMS = {};

export default function useSearchPage({
  endpoint = "/api/jewelry",
  debounceMs = 300,
  initialTerm = "",
  extraParams,
  minLength = 0,
} = {}) {
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchedTerm, setLastFetchedTerm] = useState("");

  const stableExtraParams = extraParams ?? EMPTY_PARAMS;

  const params = useMemo(
    () => ({ ...stableExtraParams, q: searchTerm.trim() }),
    [stableExtraParams, searchTerm]
  );

  useEffect(() => {
    let ignore = false;
    const trimmed = searchTerm.trim();

    if (trimmed.length < minLength) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const handle = setTimeout(async () => {
      try {
        const response = await instance.get(endpoint, { params });
        if (ignore) return;
        setResults(Array.isArray(response.data) ? response.data : []);
        setLastFetchedTerm(trimmed);
      } catch (err) {
        if (ignore) return;
        setError(err?.response?.data?.message || err.message || "Search failed");
      } finally {
        if (!ignore) setLoading(false);
      }
    }, debounceMs);

    return () => {
      ignore = true;
      clearTimeout(handle);
    };
  }, [endpoint, params, debounceMs, minLength, searchTerm]);

  const refetch = async () => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < minLength) return;
    setLoading(true);
    setError(null);
    try {
      const response = await instance.get(endpoint, { params });
      setResults(Array.isArray(response.data) ? response.data : []);
      setLastFetchedTerm(trimmed);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    lastFetchedTerm,
    refetch,
  };
}
