export interface IRequest {
  id?: number;
  requestDate: string;
  requestDescription: string;
  requestTypeId: number;
  clientFirstName: string;
  clientLastName: string;
  houseHeadStatusId: number;
  genderId: number;
  refererId: number;
  nationaltyId: number;
  provinceId: number;
  cityId: number;
  address: string;
  mobileNumber: string;
  homeNumber: string;
  areaId: number;
  religonId: number;
  requestStatusId: number;
}

export interface IRequestList {
  id: number;
  caseNumber: string,
  requestDate: string;
  createdDate: string;
  requestDescription: string;
  requestTypeId: number;
  requestTypeTitle: string | null;
  clientFirstName: string;
  clientLastName: string;
  fullName: string;
  houseHeadStatusId: number;
  houseHeadStatusTitle: string | null;
  /** متن نمایشی جنسیت در پاسخ فهرست */
  gender: string;
  genderId?: number | null;
  refererId: number;
  refererName: string | null;
  nationaltyId: number;
  nationaltyTitle: string | null;
  provinceId: number;
  provinceTitle: string | null;
  cityId: number;
  cityTitle: string | null;
  areaId: number;
  areaTitle: string | null;
  address: string;
  mobileNumber: string;
  homeNumber: string;
  religonId: number;
  religonTitle: string | null;
  requestStatusId: number;
  requestStatusTitle: string | null;
  statusReason: string;
  approveDate: string | null;
  officerDescription: string;
  attachment: string | null;
}

export interface IFilterRequest {
  requestId: number | null;
  clientFirstName: string;
  clientLastName: string;
  requestTypeIds: number[];
  requestStatusId: number | null;
  fromDate: string;
  toDate: string;
}
/**
 * پارامترهای approveRequest
 * - Id / RequestStatusId / StatusReason / ApproveDate / OfficerDescription => Query String
 * - attachment => بدنه‌ی multipart/form-data (فیلد: Attachment)
 */
export interface IApproveRequest {
  id: number;
  requestStatusId: number;
  statusReason: string;
  approveDate: string;
  officerDescription?: string;
  attachment?: File | null;
}
