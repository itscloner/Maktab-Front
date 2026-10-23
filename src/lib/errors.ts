import axios from "axios";

export class ApiError extends Error {
  status?: number;
  /** خطاهای فیلد برگشتی از سرور (کلید: نام فیلد با حرف اول کوچک) */
  fieldErrors: Record<string, string>;

  constructor(
    message: string,
    options: { status?: number; fieldErrors?: Record<string, string> } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

const lowerFirst = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function extractFieldErrors(data: unknown): Record<string, string> {
  if (!isRecord(data) || !isRecord(data.errors)) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(data.errors)) {
    const msg = Array.isArray(value) ? String(value[0] ?? "") : typeof value === "string" ? value : "";
    if (msg) out[lowerFirst(key)] = msg;
  }
  return out;
}

function extractMessage(data: unknown): string | undefined {
  if (typeof data === "string" && data.trim()) return data;
  if (isRecord(data)) {
    if (typeof data.message === "string" && data.message) return data.message;
    if (typeof data.title === "string" && data.title) return data.title;
  }
  return undefined;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        error.code === "ECONNABORTED"
          ? "زمان پاسخ‌گویی سرور به پایان رسید."
          : "ارتباط با سرور برقرار نشد. اتصال شبکه و آدرس API را بررسی کنید.",
      );
    }
    const { status, data } = error.response;
    const serverMessage = extractMessage(data);
    const fieldErrors = extractFieldErrors(data);
    const fallback: Record<number, string> = {
      400: "درخواست نامعتبر است.",
      401: "نشست شما منقضی شده یا اطلاعات ورود نامعتبر است.",
      403: "شما به این بخش دسترسی ندارید.",
      404: "مورد درخواستی یافت نشد.",
      500: "خطای داخلی سرور رخ داد.",
    };
    return new ApiError(serverMessage ?? fallback[status] ?? `خطای ناشناخته (کد ${status}).`, {
      status,
      fieldErrors,
    });
  }

  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError("خطای ناشناخته رخ داد.");
}

export const errorMessage = (error: unknown): string => toApiError(error).message;
