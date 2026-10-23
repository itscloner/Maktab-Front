import api from "@/api/axios";
import { call } from "@/api/http";
import type { ILoginRequest } from "@/interface/auth/ILoginRequest";

export const loginRequest = (formData: ILoginRequest) =>
  call<unknown>(() => api.post("User/login", formData));
