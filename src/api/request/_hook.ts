import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./_request";
import type { IApproveRequest, IFilterRequest, IRequest } from "@/interface/request/IRequest";

const LIST_KEY = ["requests"];

export const useFetchRequests = (filters?: Partial<IFilterRequest>) =>
  useQuery({ queryKey: [...LIST_KEY, filters], queryFn: () => api.fetchRequests(filters) });

export const useFetchRequest = (id?: number | null) =>
  useQuery({
    queryKey: ["request", id],
    queryFn: () => api.fetchRequest(id as number),
    enabled: typeof id === "number" && id > 0,
  });

export const useCreateRequestQuery = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["create-request"],
    mutationFn: (formData: IRequest) => api.createRequest(formData),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};

export const useUpdateRequestQuery = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["update-request"],
    mutationFn: (formData: IRequest) => api.updateRequest(formData),
    onSuccess: (_d, vars) => {
      client.invalidateQueries({ queryKey: LIST_KEY });
      client.invalidateQueries({ queryKey: ["request", vars.id] });
    },
  });
};

export const useApproveRequestQuery = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["approve-request"],
    mutationFn: (payload: IApproveRequest) => api.approveRequest(payload),
    onSuccess: (_d, vars) => {
      client.invalidateQueries({ queryKey: LIST_KEY });
      client.invalidateQueries({ queryKey: ["request", vars.id] });
    },
  });
};
