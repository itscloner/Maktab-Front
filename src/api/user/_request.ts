import api from "@/api/axios";
import { ApiError } from "@/lib/errors";
import { asArray, call } from "@/api/http";
import type { IUser, IUserPayload } from "@/interface/user/IUser";
import type { ILookupItem } from "@/interface/ILookup";

/**
 * Endpointهای مدیریت کاربران و نقش‌ها در api.rar وجود ندارند (فقط User/login تعریف شده است).
 * به‌جای حدس‌زدن، مسیرها از متغیرهای محیطی خوانده می‌شوند:
 *   VITE_USERS_ENDPOINT  و  VITE_ROLES_ENDPOINT
 * الگوی REST استاندارد (GET/POST روی مسیر پایه، GET/PUT/DELETE روی {مسیر}/{id}) فرض شده است؛
 * پیش از استفاده باید با Backend واقعی تطبیق داده شود.
 */
export const usersEndpoint = (import.meta.env.VITE_USERS_ENDPOINT ?? "").trim();
export const rolesEndpoint = (import.meta.env.VITE_ROLES_ENDPOINT ?? "").trim();

export const isUsersApiConfigured = usersEndpoint.length > 0;
export const isRolesApiConfigured = rolesEndpoint.length > 0;

const requireUsers = (): string => {
  if (!isUsersApiConfigured) throw new ApiError("Endpoint کاربران تنظیم نشده است (VITE_USERS_ENDPOINT).");
  return usersEndpoint;
};

export const fetchUsers = async () => asArray<IUser>(await call<unknown>(() => api.get(requireUsers())), "Users");
export const fetchUser = (id: number) => call<IUser>(() => api.get(`${requireUsers()}/${id}`));
export const createUser = (payload: IUserPayload) => call<unknown>(() => api.post(requireUsers(), payload));
export const updateUser = (id: number, payload: IUserPayload) =>
  call<unknown>(() => api.put(`${requireUsers()}/${id}`, payload));
export const deleteUser = (id: number) => call<unknown>(() => api.delete(`${requireUsers()}/${id}`));

export const fetchRoles = async () => {
  if (!isRolesApiConfigured) throw new ApiError("Endpoint نقش‌ها تنظیم نشده است (VITE_ROLES_ENDPOINT).");
  return asArray<ILookupItem>(await call<unknown>(() => api.get(rolesEndpoint)), "Roles");
};
