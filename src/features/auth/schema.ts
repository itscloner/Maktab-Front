import { z } from "zod";

export const loginSchema = z.object({
  userName: z.string().trim().min(1, "نام کاربری را وارد کنید."),
  password: z.string().min(1, "رمز عبور را وارد کنید."),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
