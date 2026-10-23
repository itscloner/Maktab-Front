/**
 * شکل پاسخ Endpointهای اطلاعات پایه یکسان نیست؛ علاوه بر `id`، عنوان می‌تواند در فیلدهایی مانند
 * `genderName`، `areaName`، `bankName`، `caseTypeName`، `cityName` یا `title` بیاید.
 * تشخیص برچسب در `lookupLabel` (src/utils/format.ts) انجام می‌شود.
 */
export interface ILookupItem {
  id: number;
  [key: string]: unknown;
}
