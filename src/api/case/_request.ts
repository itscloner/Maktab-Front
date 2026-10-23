import api from "@/api/axios";
import { asArray, call, cleanParams } from "@/api/http";
import { toApiError } from "@/lib/errors";
import type { ICase, ICaseFilter, ICaseMember } from "@/interface/case/ICase";

export const fetchCases = async (filters?: ICaseFilter) =>
  asArray<ICase>(await call<unknown>(() => api.get("Case", { params: cleanParams(filters) })), "Case");

export const fetchCase = (id: number) => call<ICase>(() => api.get(`Case/${id}`));

/** فیلدهای تو در توی نمایشی (اعضا، پیوست‌ها، درخواست) در بدنه Case ارسال نمی‌شوند. */
export interface ICasePersonInput {
  personId: number;
  relationId: number;
  /** ۱ = تحت تکفل، ۰ = مستقل (مطابق مدل ایجاد پرونده) */
  isDependent: 0 | 1;
}

/** شماره پرونده را کاربر وارد نمی‌کند؛ Backend می‌سازد و پس از ثبت نمایش داده می‌شود. */
export type ICaseWritePayload = Omit<ICase, "caseMembers" | "attachments" | "request" | "requestNumber" | "createdDate" | "caseNumber"> & {
  caseNumber?: string;
  personsInCase?: ICasePersonInput[];
};

export const createCase = (payload: ICaseWritePayload) => call<unknown>(() => api.post("Case", payload));

export const updateCase = (payload: ICaseWritePayload) => {
  if (!payload.id) throw new Error("شناسه پرونده برای ویرایش الزامی است.");
  return call<unknown>(() => api.put(`Case/${payload.id}`, payload));
};

export const deleteCase = (id: number) => call<unknown>(() => api.delete(`Case/${id}`));

/**
 * ثبت رابطه شخص با پرونده (POST CasePerson).
 * نام فیلد `Personal` عیناً مطابق قرارداد ارائه‌شده در api.rar حفظ شده است.
 */
export interface ICasePersonPayload {
  caseId: number;
  Personal: number;
  RelationId: number;
  IsDependent: boolean;
}

export const createCasePerson = (payload: ICasePersonPayload) => call<unknown>(() => api.post("CasePerson", payload));

export function extractId(data: unknown): number | undefined {
  if (typeof data === "number") return data;
  if (typeof data === "string" && /^\d+$/.test(data)) return Number(data);
  if (typeof data === "object" && data !== null && "id" in data) {
    const id = (data as { id: unknown }).id;
    if (typeof id === "number") return id;
  }
  return undefined;
}

export interface MemberLinkResult {
  failed: { member: ICaseMember; message: string }[];
}

/** اعضا به‌صورت ترتیبی ثبت می‌شوند و شکست هر عضو جداگانه گزارش می‌شود. */
export async function linkMembers(caseId: number, members: ICaseMember[]): Promise<MemberLinkResult> {
  const failed: MemberLinkResult["failed"] = [];
  for (const member of members) {
    try {
      await createCasePerson({
        caseId,
        Personal: member.personId,
        RelationId: member.relationId as number,
        IsDependent: member.isDependent,
      });
    } catch (e) {
      failed.push({ member, message: toApiError(e).message });
    }
  }
  return { failed };
}

export interface SaveCaseResult {
  caseId?: number;
  /** شماره پرونده‌ی ساخته‌شده (از پاسخ ایجاد یا دریافت مجدد پرونده) */
  caseNumber?: string;
  failed: MemberLinkResult["failed"];
  /** پرونده ساخته شد ولی شناسه آن در پاسخ نبود و ارتباط اشخاص ثبت نشد */
  missingId: boolean;
}

export function extractCaseNumber(data: unknown): string | undefined {
  if (typeof data === "object" && data !== null && "caseNumber" in data) {
    const v = (data as { caseNumber: unknown }).caseNumber;
    if (typeof v === "string" && v.trim()) return v;
  }
  return undefined;
}

/** ایجاد پرونده همراه با اشخاص در یک درخواست (personsInCase) و سپس یافتن شماره پرونده. */
export async function createCaseWithMembers(payload: ICaseWritePayload, members: ICaseMember[]): Promise<SaveCaseResult> {
  const personsInCase: ICasePersonInput[] = members.map((m) => ({
    personId: m.personId,
    relationId: m.relationId as number,
    isDependent: m.isDependent ? 1 : 0,
  }));
  const created = await createCase({ ...payload, personsInCase });
  const caseId = extractId(created);
  let caseNumber = extractCaseNumber(created);
  if (!caseNumber && caseId) {
    try {
      caseNumber = (await fetchCase(caseId)).caseNumber;
    } catch {
      /* پرونده ثبت شده است؛ شماره از فهرست قابل مشاهده است */
    }
  }
  return { caseId, caseNumber, failed: [], missingId: false };
}

export async function updateCaseWithNewMembers(
  payload: ICaseWritePayload,
  newMembers: ICaseMember[],
): Promise<SaveCaseResult> {
  await updateCase(payload);
  const { failed } = await linkMembers(payload.id as number, newMembers);
  return { caseId: payload.id, failed, missingId: false };
}
