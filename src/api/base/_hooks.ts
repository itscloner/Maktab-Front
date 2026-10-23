import { useQuery } from "@tanstack/react-query";
import { fetchCities, fetchLookup, type LookupKey } from "./_requests";

const ONE_HOUR = 60 * 60 * 1000;

/** فهرست اطلاعات پایه؛ برای هر کلید یک Query Key یکتا و کش طولانی‌مدت */
export const useLookup = (key: LookupKey, enabled = true) =>
  useQuery({
    queryKey: ["lookup", key],
    queryFn: () => fetchLookup(key),
    staleTime: ONE_HOUR,
    enabled,
  });

/** شهرهای یک استان (Endpoint: City/{provinceId}) */
export const useCities = (provinceId?: number | null) =>
  useQuery({
    queryKey: ["lookup", "city", provinceId],
    queryFn: () => fetchCities(provinceId as number),
    enabled: typeof provinceId === "number" && provinceId > 0,
    staleTime: ONE_HOUR,
  });
