import { QueryClient } from "@tanstack/react-query";
import { ApiError, toApiError } from "./errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: (failureCount, error) => {
        const status = (error instanceof ApiError ? error : toApiError(error)).status;
        // خطاهای کلاینت (۴xx) تکرار نمی‌شوند
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});
