import { z } from "zod";

/** شناسه انتخابی اجباری؛ مقدار انتخاب‌نشده به ۰ تبدیل نمی‌شود. */
export const requiredId = (message: string) =>
  z.number({ required_error: message, invalid_type_error: message }).int().positive(message);

export const optionalId = z.number().int().positive().nullish();

export const optionalText = (max = 500) => z.string().max(max, `حداکثر ${max} کاراکتر مجاز است.`).optional();

export const mobileSchema = z.string().regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.");

export const optionalPhone = z
  .string()
  .regex(/^(0\d{10})?$/, "شماره تلفن باید ۱۱ رقم و با صفر شروع شود (مثلاً ۰۲۱۱۲۳۴۵۶۷۸).")
  .optional();

/** حذف مقادیر undefined/null از داده ارسالی (رشته خالی حفظ می‌شود تا پاک‌کردن فیلد در ویرایش ممکن باشد) */
export function compact<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(obj) as (keyof T)[]).forEach((k) => {
    const v = obj[k];
    if (v !== undefined && v !== null) out[k] = v;
  });
  return out;
}
