/**
 * نگهداری توکن دسترسی.
 * - توکن در حافظه و sessionStorage نگه داشته می‌شود تا پس از Refresh باقی بماند
 *   و با بستن تب پاک شود (به‌جای localStorage ماندگار).
 * - در صورتی که Backend بتواند Cookie از نوع HttpOnly صادر کند، امن‌تر است؛
 *   قرارداد ارسالی (api.rar) از هدر Bearer استفاده می‌کند.
 */
const TOKEN_KEY = "mt.accessToken";
const USER_KEY = "mt.userName";

let memoryToken: string | null = null;

export const AUTH_EXPIRED_EVENT = "mt:auth-expired";

export const tokenStore = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    try {
      memoryToken = sessionStorage.getItem(TOKEN_KEY);
    } catch {
      memoryToken = null;
    }
    return memoryToken;
  },
  getUserName(): string | null {
    try {
      return sessionStorage.getItem(USER_KEY);
    } catch {
      return null;
    }
  },
  set(token: string, userName: string): void {
    memoryToken = token;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, userName);
    } catch {
      /* حافظه مرورگر در دسترس نیست؛ توکن فقط در حافظه می‌ماند */
    }
  },
  clear(): void {
    memoryToken = null;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {
      /* noop */
    }
  },
};
