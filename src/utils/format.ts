import type { ILookupItem } from "@/interface/ILookup";

const PERSIAN = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC = "٠١٢٣٤٥٦٧٨٩";

/** تبدیل ارقام فارسی/عربی به انگلیسی (برای فیلدهای عددی مانند موبایل و کد ملی) */
export const toEnglishDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (d) => String(PERSIAN.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC.indexOf(d)));

const dateFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "2-digit", day: "2-digit" });
const dateTimeFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateFa(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatDateTimeFa(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}

const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/**
 * برچسب نمایشی گزینه: ابتدا title/name، سپس هر فیلدی که با Name یا Title تمام می‌شود
 * (genderName, areaName, bankName, caseTypeName, ...)، در نهایت اولین فیلد متنی و آخر سر شناسه.
 */
export function lookupLabel(item: ILookupItem): string {
  for (const key of ["title", "name"]) {
    const v = item[key];
    if (isText(v)) return v;
  }
  const entries = Object.entries(item).filter(([k]) => k !== "id");
  const named = entries.find(([k, v]) => /(name|title)$/i.test(k) && isText(v));
  if (named) return named[1] as string;
  const anyText = entries.find(([, v]) => isText(v));
  return anyText ? (anyText[1] as string) : String(item.id);
}

export const lookupTitle = (items: ILookupItem[] | undefined, id?: number | null): string => {
  if (id === undefined || id === null) return "—";
  const found = items?.find((i) => i.id === id);
  return found ? lookupLabel(found) : "—";
};

export const toOptions = (items?: ILookupItem[]) =>
  (items ?? []).map((i) => ({ value: i.id, label: lookupLabel(i) }));

export const textOrDash = (v?: string | number | null): string =>
  v === undefined || v === null || v === "" ? "—" : String(v);

export const normalizeSearch = (s: string): string => toEnglishDigits(s).trim().toLowerCase();
