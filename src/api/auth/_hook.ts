import { useMutation } from "@tanstack/react-query";
import * as api from "./_request";
import type { ILoginRequest } from "@/interface/auth/ILoginRequest";

export const useLoginQuery = () =>
  useMutation({
    mutationKey: ["login"],
    mutationFn: (formData: ILoginRequest) => api.loginRequest(formData),
  });
