import type { IRequestList } from "../request/IRequest";

export interface ICaseMember {
  personId: number;
  relationship?: string;
  relationId?: number;
  isDependent: boolean;
  isHead: boolean;
  person?: {
    id?: number;
    nationalCode?: string;
    firstName?: string;
    lastName?: string;
    fatherName?: string;
  };
}

export interface ICaseAttachment {
  id?: number | string;
  attachmentNumber: string;
  attachmentType: string;
  fileName: string;
  file?: File | null;
  url?: string;
}

export interface ICase {
  id?: number;
  caseNumber: string;
  requestId: number;
  caseTypeId: number;
  privatenessStatusId: number;
  houseHeadStatusId: number;
  referrerId: number;
  provinceId: number;
  cityId: number;
  addressDesc: string;
  postalCode: string;
  areaId: number;
  latitude: number | null;
  longitude: number | null;
  phoneNumber: string;
  homeNumber: string;
  accountName: string;
  bankId: number;
  bankBranchName: string;
  bankBranchCode: string;
  accountNumber: string;
  iban: string;
  cardNumber: string;
  caseStageId: number;
  activeStatus: number;
  createdDate?: string;
  requestNumber?: string;
  request?: IRequestList | null;
  caseMembers?: ICaseMember[];
  attachments?: ICaseAttachment[];
}

export interface ICaseFilter {
  caseNumber?: string;
  requestId?: string;
  fromDate?: string;
  toDate?: string;
  nationalCode?: string;
  firstName?: string;
  lastName?: string;
  caseTypeId?: number | "";
  privatenessStatusId?: number | "";
}
