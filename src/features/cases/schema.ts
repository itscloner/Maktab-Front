import { z } from "zod";
import { optionalPhone, requiredId } from "@/utils/schema";

export const memberSchema = z.object({
  personId: requiredId("شخص را انتخاب کنید."),
  relationId: z.number().int().positive().nullish(),
  isDependent: z.boolean(),
  /** اعضای موجود در سرور فقط‌خواندنی‌اند (برای ویرایش/حذف آنها Endpoint ارائه نشده است) */
  existing: z.boolean().optional(),
});

export const caseSchema = z
  .object({
    requestId: requiredId("درخواست مرتبط را انتخاب کنید."),
    caseTypeId: requiredId("نوع پرونده را انتخاب کنید."),
    privatenessStatusId: requiredId("وضعیت محرمانگی را انتخاب کنید."),
    houseHeadStatusId: requiredId("وضعیت سرپرست خانوار را انتخاب کنید."),
    referrerId: requiredId("شناسه معرف را وارد کنید."),
    provinceId: requiredId("استان را انتخاب کنید."),
    cityId: requiredId("شهر را انتخاب کنید."),
    addressDesc: z.string().trim().min(1, "توضیحات نشانی را وارد کنید.").max(1000),
    postalCode: z.string().regex(/^(\d{10})?$/, "کد پستی باید ۱۰ رقم باشد.").optional(),
    areaId: requiredId("منطقه را انتخاب کنید."),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    phoneNumber: z.string().regex(/^09\d{9}$/, "شماره تماس باید ۱۱ رقم و با ۰۹ شروع شود."),
    homeNumber: optionalPhone,
    accountName: z.string().max(100).optional(),
    bankId: requiredId("بانک را انتخاب کنید."),
    bankBranchName: z.string().max(100).optional(),
    bankBranchCode: z.string().regex(/^\d*$/, "کد شعبه فقط عدد باشد.").max(20).optional(),
    accountNumber: z.string().regex(/^\d*$/, "شماره حساب فقط عدد باشد.").max(30).optional(),
    iban: z
      .string()
      .regex(/^(IR\d{24})?$/i, "شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد.")
      .optional(),
    cardNumber: z.string().regex(/^(\d{16})?$/, "شماره کارت باید ۱۶ رقم باشد.").optional(),
    caseStageId: requiredId("شناسه مرحله پرونده را وارد کنید."),
    activeStatus: z.boolean(),
    members: z.array(memberSchema),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<number>();
    v.members.forEach((m, i) => {
      if (!m.existing && !m.relationId) {
        ctx.addIssue({ code: "custom", path: ["members", i, "relationId"], message: "نسبت را وارد کنید." });
      }
      if (typeof m.personId === "number") {
        if (seen.has(m.personId)) ctx.addIssue({ code: "custom", path: ["members", i, "personId"], message: "این شخص قبلاً اضافه شده است." });
        seen.add(m.personId);
      }
    });
  });

export type CaseFormValues = z.infer<typeof caseSchema>;
export const CASE_FIELDS = Object.keys(caseSchema.innerType().shape);
