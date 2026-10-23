import { z } from "zod";
import { mobileSchema, requiredId } from "@/utils/schema";

export const makeUserSchema = (isEdit: boolean) =>
  z.object({
    firstName: z.string().trim().min(1, "نام را وارد کنید.").max(100),
    lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید.").max(100),
    userName: z.string().trim().min(3, "نام کاربری حداقل ۳ کاراکتر باشد.").max(100),
    // هنگام ویرایش، خالی‌بودن یعنی «بدون تغییر رمز عبور»
    password: isEdit
      ? z.string().refine((v) => v === "" || v.length >= 6, "رمز عبور حداقل ۶ کاراکتر باشد.")
      : z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد."),
    mobile: mobileSchema,
    roleId: requiredId("نقش را انتخاب کنید."),
  });

export type UserFormValues = z.infer<ReturnType<typeof makeUserSchema>>;
export const USER_FIELDS = ["firstName", "lastName", "userName", "password", "mobile", "roleId"] as const;
