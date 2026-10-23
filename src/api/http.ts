import type { AxiosResponse } from "axios";
import { ApiError, toApiError } from "@/lib/errors";

interface Envelope {
  data: unknown;
  message?: string;
  isSuccedded: boolean;
}

function isEnvelope(v: unknown): v is Envelope {
  return typeof v === "object" && v !== null && "isSuccedded" in v && typeof (v as Envelope).isSuccedded === "boolean";
}

/**
 * پاسخ‌ها طبق IResponse به شکل { data, message, isSuccedded } هستند.
 * اگر پاسخ در این قالب نبود، همان مقدار خام برگردانده می‌شود.
 */
export function unwrap<T>(payload: unknown): T {
  if (isEnvelope(payload)) {
    if (!payload.isSuccedded) {
      throw new ApiError(payload.message || "عملیات با خطا مواجه شد.");
    }
    return payload.data as T;
  }
  return payload as T;
}

/** اجرای درخواست؛ هر خطا (شبکه/HTTP/isSuccedded=false) به ApiError تبدیل و پرتاب می‌شود. */
export async function call<T>(fn: () => Promise<AxiosResponse<unknown>>): Promise<T> {
  try {
    const { data } = await fn();
    return unwrap<T>(data);
  } catch (error) {
    throw toApiError(error);
  }
}

export function asArray<T>(value: unknown, what: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value === null || value === undefined) return [];
  throw new ApiError(`ساختار پاسخ «${what}» فهرست نبود.`);
}

/** حذف مقادیر خالی از پارامترهای Query */
export function cleanParams<T extends object>(params?: T): Record<string, unknown> | undefined {
  if (!params) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out;
}
