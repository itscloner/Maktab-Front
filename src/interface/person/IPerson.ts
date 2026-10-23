export interface IPerson {
  id?: number;
  nationalCode: string;
  firstName: string;
  lastName: string;
  nickName: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  homeNumber: string;
  genderId: number;
  birthDate: string;
  shenasnamehNumber: string;
  shenasnamehSeries: string;
  birthProvinceId: number;
  birthCityId: number;
  maritalStatusId: number;
  nationalityId: number;
  religonId: number;
  jobId: number;
  skillId: number;
  interest: string;
  wish: string;
  dependancyStatusId: number;
  educationStatusId: number;
  educationLevelId: number;
  averageScore: string;
  orphanStatusId: number;
  income: string;
  incomeDesc: string;
  physicalStatusId: number;
  sicknessType: string;
  employmentStatusId: number;
  unemploymentReasonId: number;
  sadatStatusId: number;
}

/** داده ارسالی فرم؛ فیلدهای انتخاب‌نشده ارسال نمی‌شوند (به‌جای مقدار ساختگی ۰). */
export type IPersonPayload = Partial<IPerson>;
