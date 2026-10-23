import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./_request";
import type { IPersonPayload } from "@/interface/person/IPerson";

const LIST_KEY = ["persons"];

export const useFetchPersons = (filters?: Record<string, unknown>) =>
  useQuery({ queryKey: [...LIST_KEY, filters], queryFn: () => api.fetchPersons(filters) });

export const useFetchPerson = (id?: number | null) =>
  useQuery({
    queryKey: ["person", id],
    queryFn: () => api.fetchPerson(id as number),
    enabled: typeof id === "number" && id > 0,
  });

export const useCreatePersonQuery = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["create-person"],
    mutationFn: (payload: IPersonPayload) => api.createPerson(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};

export const useUpdatePersonQuery = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["update-person"],
    mutationFn: (payload: IPersonPayload) => api.updatePerson(payload),
    onSuccess: (_d, payload) => {
      client.invalidateQueries({ queryKey: LIST_KEY });
      client.invalidateQueries({ queryKey: ["person", payload.id] });
    },
  });
};

export const useDeletePersonQuery = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["delete-person"],
    mutationFn: (id: number) => api.deletePerson(id),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};
