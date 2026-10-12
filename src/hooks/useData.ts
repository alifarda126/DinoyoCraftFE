import useSWR from "swr";
import api from "../lib/axios";

// Fetcher yang menggunakan axios dan sudah dilengkapi interceptor token
const fetcher = (url: string) => api.get(url).then((res) => res.data);

/**
 * Hook kustom SWR untuk kemudahan data fetching.
 * Secara otomatis menggunakan global axios client (sehingga Authorization header sudah masuk).
 */
export function useData<T>(endpoint: string | null) {
  const { data, error, isLoading, mutate } = useSWR<T>(endpoint, fetcher);

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}
