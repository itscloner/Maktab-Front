/** مدل ورودی کاربر مطابق قرارداد ارائه‌شده در دستور پروژه */
export interface IUserPayload {
  firstName: string;
  lastName: string;
  userName: string;
  password?: string;
  mobile: string;
  roleId: number;
}

/** مدل پاسخ کاربر؛ ساختار دقیق پاسخ Backend ارائه نشده و فقط فیلدهای مدل ورودی انتظار می‌رود. */
export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  userName: string;
  mobile?: string | null;
  roleId?: number | null;
  roleTitle?: string | null;
}
