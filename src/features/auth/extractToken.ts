/**
 * ساختار دقیق پاسخ User/login در api.rar مشخص نشده است (ILoginResponse فقط IResponse با data: any است).
 * تنها دو شکل رایج پذیرفته می‌شود و در غیر این صورت ورود با پیام خطا متوقف می‌شود (بدون حدس بیشتر):
 *   1) data خودش رشته توکن باشد
 *   2) data.token یا data.accessToken رشته باشد
 * اگر Backend شکل دیگری دارد، فقط همین تابع باید اصلاح شود.
 */
export function extractToken(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (typeof data === "object" && data !== null) {
    const rec = data as Record<string, unknown>;
    for (const key of ["accessToken", "token"]) {
      const v = rec[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}
