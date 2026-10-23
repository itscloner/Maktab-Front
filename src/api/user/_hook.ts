import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./_request";
import type { IUserPayload } from "@/interface/user/IUser";

const LIST_KEY = ["users"];

export const useFetchUsers = () =>
  useQuery({ queryKey: LIST_KEY, queryFn: api.fetchUsers, enabled: api.isUsersApiConfigured });

export const useFetchRoles = () =>
  useQuery({ queryKey: ["roles"], queryFn: api.fetchRoles, enabled: api.isRolesApiConfigured, staleTime: 60 * 60 * 1000 });

export const useCreateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["create-user"],
    mutationFn: (payload: IUserPayload) => api.createUser(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};

export const useUpdateUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["update-user"],
    mutationFn: (vars: { id: number; payload: IUserPayload }) => api.updateUser(vars.id, vars.payload),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};

export const useDeleteUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationKey: ["delete-user"],
    mutationFn: (id: number) => api.deleteUser(id),
    onSuccess: () => client.invalidateQueries({ queryKey: LIST_KEY }),
  });
};
