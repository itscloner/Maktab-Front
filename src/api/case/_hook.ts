import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./_request";
import type { ICaseFilter, ICaseMember } from "@/interface/case/ICase";

const LIST_KEY = ["cases"];

export const useFetchCases = (filters?: ICaseFilter) =>
  useQuery({ queryKey: [...LIST_KEY, filters], queryFn: () => api.fetchCases(filters) });

export const useFetchCase = (id?: number | null) =>
  useQuery({
    queryKey: ["case", id],
    queryFn: () => api.fetchCase(id as number),
    enabled: typeof id === "number" && id > 0,
    retry: false,
  });

export const useCreateCase = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["create-case"],
    mutationFn: (vars: { payload: api.ICaseWritePayload; members: ICaseMember[] }) =>
      api.createCaseWithMembers(vars.payload, vars.members),
    onSettled: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};

export const useUpdateCase = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["update-case"],
    mutationFn: (vars: { payload: api.ICaseWritePayload; newMembers: ICaseMember[] }) =>
      api.updateCaseWithNewMembers(vars.payload, vars.newMembers),
    onSettled: (_d, _e, vars) => {
      client.invalidateQueries({ queryKey: LIST_KEY });
      client.invalidateQueries({ queryKey: ["case", vars.payload.id] });
    },
  });
};

export const useDeleteCase = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["delete-case"],
    mutationFn: (id: number) => api.deleteCase(id),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};
