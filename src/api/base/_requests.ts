import api from "../axios";
import { asArray, call } from "../http";
import type { ILookupItem } from "@/interface/ILookup";

/** نام Endpointهای اطلاعات پایه، دقیقاً مطابق api.rar */
export const LOOKUP_ENDPOINTS = {
  province: "Province",
  religon: "Religon",
  nationality: "Nationality",
  area: "Area",
  requestType: "RequestType",
  houseHeadStatus: "HouseHeadStatus",
  requestStatus: "RequestStatus",
  donor: "Donor",
  physicalStatus: "PhysicalStatus",
  privatenessStatus: "PrivatenessStatus",
  skill: "Skill",
  unemploymentReason: "UnemploymentReason",
  orphanStatus: "OrphanStatus",
  maritalStatus: "MaritalStatus",
  job: "Job",
  housingStatus: "HousingStatus",
  goodWorkType: "GoodWorkType",
  gender: "Gender",
  employmentStatus: "EmploymentStatus",
  educationalStatus: "EducationalStatus",
  educationLevel: "EducationLevel",
  dependancyStatus: "DependancyStatus",
  charityMainRole: "CharityMainRole",
  caseType: "CaseType",
  bank: "Bank",
} as const;

export type LookupKey = keyof typeof LOOKUP_ENDPOINTS;

export const fetchLookup = async (key: LookupKey): Promise<ILookupItem[]> =>
  asArray<ILookupItem>(await call<unknown>(() => api.get(LOOKUP_ENDPOINTS[key])), LOOKUP_ENDPOINTS[key]);

export const fetchCities = async (provinceId: number): Promise<ILookupItem[]> =>
  asArray<ILookupItem>(await call<unknown>(() => api.get(`City/${provinceId}`)), "City");
