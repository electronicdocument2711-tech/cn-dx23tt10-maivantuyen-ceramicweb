import { useCallback, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/utils";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error?: string;
};

type UseAsyncOptions = {
  runOnMount?: boolean; // default true: chạy 1 lần lúc mount
};

export function useAsync<T>(
  queryFn: (signal: AbortSignal) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { runOnMount = true } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: runOnMount,
    error: undefined,
  });

  const abortRef = useRef<AbortController | null>(null);

  const queryRef = useRef(queryFn);
  useEffect(() => {
    queryRef.current = queryFn;
  }, [queryFn]);

  const execute = useCallback(async () => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: undefined }));

    try {
      const res = await queryRef.current(controller.signal);
      setState({ data: res, loading: false, error: undefined });
      return res;
    } catch (err: any) {
      if (err?.name === "AbortError") return;

      const message = getErrorMessage(err, "Có lỗi xảy ra");
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  useEffect(() => {
    if (!runOnMount) return;
    execute();

    return () => {
      abortRef.current?.abort();
    };
  }, [runOnMount, execute]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ data: null, loading: false, error: undefined });
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    execute, // manual run
    refetch: execute, // alias
    reset,
  };
}
