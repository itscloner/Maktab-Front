import api from "@/api/axios";
import { asArray, call, cleanParams } from "@/api/http";
import type { IPerson, IPersonPayload } from "@/interface/person/IPerson";

// توجه: نام Resource در قرارداد ارائه‌شده «Perosn» است و عیناً حفظ شده است.
const RESOURCE = "Perosn";

export const createPerson = (payload: IPersonPayload) => call<unknown>(() => api.post(RESOURCE, payload));

export const fetchPersons = async (filters?: Record<string, unknown>) =>
  asArray<IPerson>(await call<unknown>(() => api.get(RESOURCE, { params: cleanParams(filters) })), RESOURCE);

export const fetchPerson = (id: number) => call<IPerson>(() => api.get(`${RESOURCE}/${id}`));

export const updatePerson = (payload: IPersonPayload) => {
  if (!payload.id) throw new Error("شناسه شخص برای ویرایش الزامی است.");
  return call<unknown>(() => api.put(`${RESOURCE}/${payload.id}`, payload));
};

// در api.rar این Endpoint با توضیح «از الگوی REST استنباط شده» آمده است؛ وجود آن در Backend باید تأیید شود.
export const deletePerson = (id: number) => call<unknown>(() => api.delete(`${RESOURCE}/${id}`));
