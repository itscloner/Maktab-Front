import api from "@/api/axios";
import { asArray, call, cleanParams } from "@/api/http";
import type {
  IApproveRequest,
  IFilterRequest,
  IRequest,
  IRequestList,
} from "@/interface/request/IRequest";

export const createRequest = (formData: IRequest) => call<unknown>(() => api.post("Request", formData));

export const fetchRequests = async (filters?: Partial<IFilterRequest>) =>
  asArray<IRequestList>(await call<unknown>(() => api.get("Request", { params: cleanParams(filters) })), "Request");

export const fetchRequest = (id: number) => call<IRequestList>(() => api.get(`Request/${id}`));

export const updateRequest = (formData: IRequest) => {
  if (!formData.id) throw new Error("شناسه درخواست برای ویرایش الزامی است.");
  return call<unknown>(() => api.put(`Request/${formData.id}`, formData));
};

/**
 * POST Request/approve
 * - پارامترها در Query String و فایل در بدنه multipart/form-data (فیلد Attachment)؛
 *   مطابق توضیح IApproveRequest در api.rar.
 */
export const approveRequest = (payload: IApproveRequest) => {
  const body = new FormData();
  if (payload.attachment) body.append("Attachment", payload.attachment, payload.attachment.name);
  const params = cleanParams({
    Id: payload.id,
    RequestStatusId: payload.requestStatusId,
    StatusReason: payload.statusReason,
    ApproveDate: payload.approveDate,
    OfficerDescription: payload.officerDescription,
  });
  return call<unknown>(() =>
    api.post("Request/approve", body, {
      params,
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }),
  );
};
