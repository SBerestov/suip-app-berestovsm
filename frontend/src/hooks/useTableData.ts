import React from "react";
import type { TableType } from "../types";

export const useTableData = (tableName: TableType, searchQuery: string, refreshTrigger: number = 0) => {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const prevQuery = React.useRef<string | null>(null);

  React.useEffect(() => {
    const queryKey = `${tableName}|${searchQuery}`;
    const showSpinner = prevQuery.current !== queryKey;
    prevQuery.current = queryKey;

    const fetchData = async () => {
      try {
        if (showSpinner) setLoading(true);
        setError(null);

        const response = await fetch(`/api/${tableName}?search=${encodeURIComponent(searchQuery)}`);

        if (!response.ok) {
          throw new Error(`Ошибка загрузки данных: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [tableName, searchQuery, refreshTrigger]);

  return { data, loading, error };
};