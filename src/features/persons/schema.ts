import { z } from "zod";
import { mobileSchema, optionalId, optionalPhone, optionalText, requiredId } from "@/utils/schema";

export const personSchema = z.object({
  nationalCode: z.string().regex(/^\d{10}$/, "کد ملی باید ۱۰ رقم باشد."),
  firstName: z.string().trim().min(1, "نام را وارد کنید.").max(100),
  lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید.").max(100),
  nickName: optionalText(100),
  fatherName: optionalText(100),
  motherName: optionalText(100),
  mobile: mobileSchema.or(z.literal("")).optional(),
  homeNumber: optionalPhone,
  genderId: requiredId("جنسیت را انتخاب کنید."),
  birthDate: z.string().optional(),
  shenasnamehNumber: optionalText(20),
  shenasnamehSeries: optionalText(20),
  birthProvinceId: optionalId,
  birthCityId: optionalId,
  maritalStatusId: optionalId,
  nationalityId: optionalId,
  religonId: optionalId,
  jobId: optionalId,
  skillId: optionalId,
  interest: optionalText(500),
  wish: optionalText(500),
  dependancyStatusId: optionalId,
  educationStatusId: optionalId,
  educationLevelId: optionalId,
  averageScore: optionalText(10),
  orphanStatusId: optionalId,
  income: optionalText(30),
  incomeDesc: optionalText(500),
  physicalStatusId: optionalId,
  sicknessType: optionalText(200),
  employmentStatusId: optionalId,
  unemploymentReasonId: optionalId,
  sadatStatusId: optionalId,
});

export type PersonFormValues = z.infer<typeof personSchema>;
export const PERSON_FIELDS = Object.keys(personSchema.shape);
