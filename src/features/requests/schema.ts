import { z } from "zod";
import { mobileSchema, optionalPhone, requiredId } from "@/utils/schema";

export const requestSchema = z.object({
  requestDate: z
    .string({ required_error: "تاریخ درخواست را مشخص کنید." })
    .min(1, "تاریخ درخواست را مشخص کنید."),
  requestDescription: z
    .string()
    .trim()
    .min(1, "توضیحات درخواست را وارد کنید.")
    .max(2000),
  requestTypeId: requiredId("نوع درخواست را انتخاب کنید."),
  clientFirstName: z
    .string()
    .trim()
    .min(1, "نام متقاضی را وارد کنید.")
    .max(100),
  clientLastName: z
    .string()
    .trim()
    .min(1, "نام خانوادگی متقاضی را وارد کنید.")
    .max(100),
  houseHeadStatusId: requiredId("وضعیت سرپرست خانوار را انتخاب کنید."),
  genderId: requiredId("جنسیت را انتخاب کنید."),
  refererId: requiredId("شناسه معرف را وارد کنید."),
  nationaltyId: requiredId("ملیت را انتخاب کنید."),
  provinceId: requiredId("استان را انتخاب کنید."),
  cityId: requiredId("شهر را انتخاب کنید."),
  address: z.string().trim().min(1, "نشانی را وارد کنید.").max(1000),
  mobileNumber: mobileSchema,
  homeNumber: optionalPhone,
  areaId: requiredId("منطقه را انتخاب کنید."),
  religonId: requiredId("مذهب را انتخاب کنید."),
  requestStatusId: requiredId("وضعیت درخواست را انتخاب کنید."),
});

export type RequestFormValues = z.infer<typeof requestSchema>;
export const REQUEST_FIELDS = Object.keys(requestSchema.shape);

export const approveSchema = z.object({
  requestStatusId: requiredId("وضعیت جدید را انتخاب کنید."),
  statusReason: z
    .string()
    .trim()
    .min(1, "دلیل تغییر وضعیت را وارد کنید.")
    .max(1000),
  approveDate: z
    .string({ required_error: "تاریخ تأیید را مشخص کنید." })
    .min(1, "تاریخ تأیید را مشخص کنید."),
  officerDescription: z.string().max(2000).optional(),
  attachment: z.instanceof(File, { message: "فایل نامعتبر است." }).optional(),
});

export type ApproveFormValues = z.infer<typeof approveSchema>;
